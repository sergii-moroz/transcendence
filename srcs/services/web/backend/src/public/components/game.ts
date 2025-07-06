import { Router } from "../router-static.js";
import { gameJson, GameState } from "../types.js";

export class GameRoom extends HTMLElement {
	socket: WebSocket | null = null;
	canvas!: HTMLCanvasElement;
	ctx!: CanvasRenderingContext2D;
	gameRoomId!: string;
	latestState: GameState | null = null;
	gameOver: boolean = false;
	gameOverMessage: {message: string, winner: string} | null = null;
	keysPressed: { [key: string]: boolean } = {};
	private renderLoopId: number | null = null;
	private lastFrameTime: number = 0;
	private targetFPS: number = 60; // Target 60 FPS for smoother gameplay
	private upButton!: HTMLButtonElement;
	private downButton!: HTMLButtonElement;

	constructor() {
		super();
	}

	connectedCallback() {
		this.gameRoomId = window.location.pathname.split('/')[2];
		this.render();
		this.handleSocket();
		this.canvas = document.getElementById("game") as HTMLCanvasElement;
		
		if (!this.canvas) {
			console.error("Canvas element not found!");
			return;
		}
		
		this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		
		if (!this.ctx) {
			console.error("Canvas context not available!");
			return;
		}
		
		console.log("Canvas initialized:", this.canvas.offsetWidth, this.canvas.offsetHeight);
		this.handleCanvasScaling();
		
		// Force an initial render to make sure the canvas is visible
		this.forceInitialRender();
		
		// Set up controls
		this.setupControls();
		
		window.addEventListener('resize', this.handleCanvasScaling);
		this.renderLoop();
	}

	disconnectedCallback() {
		// Clean up render loop
		if (this.renderLoopId) {
			cancelAnimationFrame(this.renderLoopId);
			this.renderLoopId = null;
		}
		
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.close();
			console.log('Disconnecting from socket, page unload...');
		}
		
		// Remove event listeners
		this.removeControls();
		window.removeEventListener('resize', this.handleCanvasScaling);
	}

	render = () => {
		this.innerHTML = `
		<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; width: 100%; overflow: hidden; background-color: #222;">
			<h2 id="score" style="color: white; margin-bottom: 20px; font-size: 24px;"></h2>
			<canvas id="game" style="display: block; max-width: 100%; max-height: 60vh; border: 2px solid #ff0000;"></canvas>
			
			<!-- Mobile Control Buttons -->
			<div id="mobile-controls" style="display: flex; width: 100%; height: 120px; margin-top: 20px; gap: 4px;">
				<button id="move-up-btn" style="
					width: 50%; 
					height: 100%; 
					background: linear-gradient(45deg, #02a5f7, #0284d7); 
					border: none; 
					color: white; 
					font-size: 28px; 
					font-weight: bold;
					border-radius: 12px;
					user-select: none;
					touch-action: manipulation;
					transition: all 0.1s ease;
					box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
					display: flex;
					align-items: center;
					justify-content: center;
				">▲ UP</button>
				<button id="move-down-btn" style="
					width: 50%; 
					height: 100%; 
					background: linear-gradient(45deg, #f7026a, #d70254); 
					border: none; 
					color: white; 
					font-size: 28px; 
					font-weight: bold;
					border-radius: 12px;
					user-select: none;
					touch-action: manipulation;
					transition: all 0.1s ease;
					box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
					display: flex;
					align-items: center;
					justify-content: center;
				">▼ DOWN</button>
			</div>
		</div>
		`;
	}

	handleSocket = () => {
		this.socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/ws/game/${this.gameRoomId}`);

		this.socket.onopen = () => {
			console.log('WebSocket connection established.');
		}

		this.socket.onmessage = (event) => {
			const data = JSON.parse(event.data) as gameJson;

			if (data.type === 'gameState') {
				this.latestState = data.state as GameState;
			}

			if (data.type === 'Error') {
				this.socket?.send(JSON.stringify({ type: 'exit' }));
				alert(data.message);
				console.error('WebSocket error:', data.message);
				Router.navigateTo('/home');
			}

			if (data.type === 'victory') {
				this.gameOver = true;
				this.gameOverMessage = {
					message: data.message as string,
					winner: data.winner as string
				};
				console.log('Game over:', data.message, data.winner, data.tournamentId);
				setTimeout(() => {
					// this.socket?.send(JSON.stringify({ type: 'exit' }));
					if(data.tournamentId !== null) {
						console.log("Redirecting to tournament:", data.tournamentId);
						Router.navigateTo(`/tournament/${data.tournamentId}`);
					} else {
						Router.navigateTo('/victory-screen');
					}
				}, 3000);
			}

			if (data.type === 'defeat') {
				this.gameOver = true;
				this.gameOverMessage = {
					message: data.message as string,
					winner: data.winner as string
				};
				console.log('Game over:', data.message, data.winner, data.tournamentId);
				setTimeout(() => {
					// this.socket?.send(JSON.stringify({ type: 'exit' }));
					Router.navigateTo('/loss-screen');
				}, 3000);
			}
		};

		this.socket.onclose = () => {
			console.log("WebSocket connection got closed by server");
		};

		this.socket.onerror = (err: Event) => {
			this.socket?.send(JSON.stringify({ type: 'exit' }));
			alert(`WebSocket error: ${err}`);
			console.error('WebSocket error:', err);
			Router.navigateTo('/home');
		};
	}

	sendInput = () => {
		if (this.gameOver || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
			return;
		}

		if (this.keysPressed['ArrowUp']) {
			this.socket.send(JSON.stringify({ type: 'input', input: 'up' }));
		}
		if (this.keysPressed['ArrowDown']) {
			this.socket.send(JSON.stringify({ type: 'input', input: 'down' }));
		}
	}

	renderLoop = () => {
		const currentTime = performance.now();
		const deltaTime = currentTime - this.lastFrameTime;
		const targetFrameTime = 1000 / this.targetFPS;
		
		// Always send input for responsive controls
		this.sendInput();
		
		// Throttle rendering to target FPS for mobile performance
		if (deltaTime >= targetFrameTime) {
			if (this.latestState && !this.gameOver) {
				this.drawGameState(this.latestState);
			} else if (this.gameOver) {
				this.drawGameOver(this.gameOverMessage!.message, this.gameOverMessage!.winner);
			}
			this.lastFrameTime = currentTime;
		}
		
		this.renderLoopId = requestAnimationFrame(this.renderLoop);
	}

	handleCanvasScaling = () => {
		console.log("handleCanvasScaling called");
		console.log("Window dimensions:", window.innerWidth, window.innerHeight);
		
		// Simpler approach for mobile compatibility
		const maxWidth = Math.min(window.innerWidth * 0.9, 1000);
		const maxHeight = Math.min(window.innerHeight * 0.7, 600); // Reduced to 70% for mobile

		let width = maxWidth;
		let height = width * 3 / 5;

		if (height > maxHeight) {
			height = maxHeight;
			width = height * 5 / 3;
		}

		console.log("Calculated canvas size:", width, height);

		// Set canvas size without devicePixelRatio complications
		this.canvas.width = Math.round(width);
		this.canvas.height = Math.round(height);
		
		// Ensure canvas is visible and properly positioned
		this.canvas.style.width = Math.round(width) + 'px';
		this.canvas.style.height = Math.round(height) + 'px';
		this.canvas.style.display = 'block';
		this.canvas.style.border = '2px solid #ff0000'; // Bright red border for visibility
		this.canvas.style.backgroundColor = '#000000'; // Black background
		this.canvas.style.margin = '10px auto';
		this.canvas.style.position = 'relative';
		this.canvas.style.zIndex = '1000';
		this.canvas.style.touchAction = 'manipulation'; // Prevent default touch actions
		
		console.log("Canvas styling applied:", this.canvas.offsetWidth, this.canvas.offsetHeight);
	}

	logicalToCanvasX(x: number): number {
		return (x + 250) / 500 * this.canvas.width;
	}

	logicalToCanvasY(y: number): number {
		return (y + 150) / 300 * this.canvas.height;
	}

	drawBall = (x: number, y: number, dx: number, dy: number) => {
		let radius = this.canvas.width / 100;

		const speed = Math.sqrt(dx * dx + dy * dy);
		const baseSpeed = 5; // standard speed
		const maxSpeed = 10; // adjust as needed for your game

		// Map speed to a value between 0 (white) and 1 (red)
		const t = Math.min(1, (speed - baseSpeed) / (maxSpeed - baseSpeed));

		// Interpolate color: white (t=0) to red (t=1)
		// White: hsl(0, 0%, 100%)
		// Red:   hsl(0, 100%, 50%)
		const saturation = t * 100;
		const lightness = 100 - t * 50;

		this.ctx.fillStyle = `hsl(0, ${saturation}%, ${lightness}%)`;

		// this.ctx.fillStyle = "#ffffff"
		this.ctx.beginPath()
		this.ctx.arc(x, y, radius, 0.0, 2.0 * Math.PI, false)
		this.ctx.closePath()
		this.ctx.fill()
	}

	clearField = (width: number, height: number) => {
		this.ctx.fillStyle = "#393f3f"
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	drawPaddle1 = (y: number) => {
		const w = this.canvas.width / 50;
		const h = this.canvas.height / 5;

		this.ctx.fillStyle = "#02a5f7";
		this.ctx.fillRect(0, y - 0.5 * h, w, h);
	}

	drawPaddle2 = (y: number) => {
		const w = this.canvas.width / 50;
		const h = this.canvas.height / 5;

		this.ctx.fillStyle = "#f7026a";
		this.ctx.fillRect(this.canvas.width - w, y - 0.5 * h, w, h);
	}

	drawScore = (pos_x: number, pos_y: number, score: number, username: string) => {
		this.ctx.fillStyle = "#bfbfbf"
		this.ctx.font = "30px Arial"
		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "top";

		this.ctx.fillText(score.toString(), pos_x, pos_y);
		this.ctx.font = "15px Arial"
		this.ctx.fillText(username, pos_x, pos_y + 30);
	}

	drawGameOver = (message: string, winner: string) => {
		if(winner == 'player1') {
			this.ctx.fillStyle = "#02a5f7"
		}
		else {
			this.ctx.fillStyle = "#f7026a"
		}
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = "#ffffff";
		this.ctx.font = `bold ${this.canvas.width / 30}px Arial`;
		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "middle";
		this.ctx.fillText(message, (this.canvas.width / 2), this.canvas.height / 2);
		this.ctx.font = `${this.canvas.width / 50}px Arial`;
		this.ctx.fillText(`Redirecting in 3 seconds`, (this.canvas.width / 2), (this.canvas.height / 2) + 30);
	}

	drawGameState = (state: GameState) => {
		let score1_x = (this.canvas.width / 5);
		let score2_x = this.canvas.width - (this.canvas.width / 5);
		let score_y = (this.canvas.height / 3);

		this.clearField(this.canvas.width, this.canvas.height)
		this.drawScore(score1_x, score_y, state.scores.player1, state.scores.user1)
		this.drawScore(score2_x, score_y, state.scores.player2, state.scores.user2)
		this.drawPaddle1(this.logicalToCanvasY(state.paddles.player1.y))
		this.drawPaddle2(this.logicalToCanvasY(state.paddles.player2.y))
		this.drawBall(this.logicalToCanvasX(state.ball.x), this.logicalToCanvasY(state.ball.y), state.ball.dx, state.ball.dy);
	}

	forceInitialRender = () => {
		// Draw a simple test pattern to make sure the canvas is working
		this.ctx.fillStyle = "#FF0000";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = "#FFFFFF";
		this.ctx.font = "30px Arial";
		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "middle";
		this.ctx.fillText("Game Loading...", this.canvas.width / 2, this.canvas.height / 2);
		console.log("Initial render complete");
	}

	setupControls = () => {
		// Get button elements
		this.upButton = document.getElementById("move-up-btn") as HTMLButtonElement;
		this.downButton = document.getElementById("move-down-btn") as HTMLButtonElement;
		
		if (!this.upButton || !this.downButton) {
			console.error("Control buttons not found!");
			return;
		}
		
		// Keyboard controls for desktop
		document.addEventListener('keydown', this.handleKeyDown);
		document.addEventListener('keyup', this.handleKeyUp);
		
		// Button controls for mobile
		// Mouse events for desktop testing
		this.upButton.addEventListener('mousedown', this.handleUpStart);
		this.upButton.addEventListener('mouseup', this.handleUpEnd);
		this.upButton.addEventListener('mouseleave', this.handleUpEnd);
		
		this.downButton.addEventListener('mousedown', this.handleDownStart);
		this.downButton.addEventListener('mouseup', this.handleDownEnd);
		this.downButton.addEventListener('mouseleave', this.handleDownEnd);
		
		// Touch events for mobile
		this.upButton.addEventListener('touchstart', this.handleUpStart, { passive: false });
		this.upButton.addEventListener('touchend', this.handleUpEnd, { passive: false });
		this.upButton.addEventListener('touchcancel', this.handleUpEnd, { passive: false });
		
		this.downButton.addEventListener('touchstart', this.handleDownStart, { passive: false });
		this.downButton.addEventListener('touchend', this.handleDownEnd, { passive: false });
		this.downButton.addEventListener('touchcancel', this.handleDownEnd, { passive: false });
		
		console.log("Controls setup complete");
	}

	removeControls = () => {
		document.removeEventListener('keydown', this.handleKeyDown);
		document.removeEventListener('keyup', this.handleKeyUp);
		
		if (this.upButton) {
			this.upButton.removeEventListener('mousedown', this.handleUpStart);
			this.upButton.removeEventListener('mouseup', this.handleUpEnd);
			this.upButton.removeEventListener('mouseleave', this.handleUpEnd);
			this.upButton.removeEventListener('touchstart', this.handleUpStart);
			this.upButton.removeEventListener('touchend', this.handleUpEnd);
			this.upButton.removeEventListener('touchcancel', this.handleUpEnd);
		}
		
		if (this.downButton) {
			this.downButton.removeEventListener('mousedown', this.handleDownStart);
			this.downButton.removeEventListener('mouseup', this.handleDownEnd);
			this.downButton.removeEventListener('mouseleave', this.handleDownEnd);
			this.downButton.removeEventListener('touchstart', this.handleDownStart);
			this.downButton.removeEventListener('touchend', this.handleDownEnd);
			this.downButton.removeEventListener('touchcancel', this.handleDownEnd);
		}
	}

	handleKeyDown = (e: KeyboardEvent) => {
		if (this.gameOver) return;
		if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
			e.preventDefault();
			this.keysPressed[e.key] = true;
		}
	}

	handleKeyUp = (e: KeyboardEvent) => {
		if (this.gameOver) return;
		if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
			e.preventDefault();
			this.keysPressed[e.key] = false;
		}
	}

	handleUpStart = (e: Event) => {
		e.preventDefault();
		if (this.gameOver) return;
		this.keysPressed['ArrowUp'] = true;
		this.upButton.style.transform = 'scale(0.95)';
		this.upButton.style.filter = 'brightness(1.2)';
	}

	handleUpEnd = (e: Event) => {
		e.preventDefault();
		this.keysPressed['ArrowUp'] = false;
		this.upButton.style.transform = 'scale(1)';
		this.upButton.style.filter = 'brightness(1)';
	}

	handleDownStart = (e: Event) => {
		e.preventDefault();
		if (this.gameOver) return;
		this.keysPressed['ArrowDown'] = true;
		this.downButton.style.transform = 'scale(0.95)';
		this.downButton.style.filter = 'brightness(1.2)';
	}

	handleDownEnd = (e: Event) => {
		e.preventDefault();
		this.keysPressed['ArrowDown'] = false;
		this.downButton.style.transform = 'scale(1)';
		this.downButton.style.filter = 'brightness(1)';
	}
}
