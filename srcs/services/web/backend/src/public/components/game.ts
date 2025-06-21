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

	constructor() {
		super();
	}
	
	connectedCallback() {
		this.gameRoomId = window.location.pathname.split('/')[2];
		this.render();
		this.handleSocket();
		this.canvas = document.getElementById("game") as HTMLCanvasElement;
		this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		this.handleCanvasScaling();
		document.addEventListener('keydown', this.handleUserInput);
		window.addEventListener('resize', this.handleCanvasScaling);
		this.renderLoop();
	}

	disconnectedCallback() {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.close();
			console.log('Disconnecting from socket, page unload...');
		}
		document.removeEventListener('keydown', this.handleUserInput);
		window.removeEventListener('resize', this.handleCanvasScaling);
	}

	render = () => {
		this.innerHTML = `
		<div style="display: flex; flex-direction: column; align-items: center;">
			<h2 id="score"></h2>
			<canvas id="game"></canvas>
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

			if (data.type === 'gameOver') {
				this.gameOver = true;
				this.gameOverMessage = {
					message: data.message as string,
					winner: data.winner as string
				};
				console.log('Game over:', data.message, data.winner, data.tournamentId);
				setTimeout(() => {
					this.socket?.send(JSON.stringify({ type: 'exit' }));
					if(data.tournamentId !== null) {
						console.log("Redirecting to tournament:", data.tournamentId);
						Router.navigateTo(`/tournament/${data.tournamentId}`);
					} else {
						Router.navigateTo('/loss-screen');
					}
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

	 handleUserInput = (e: KeyboardEvent) => {
		if (this.gameOver) {
			return; // Ignore input if the game is over
		}
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				this.socket.send(JSON.stringify({ type: 'input', input: 'up' }));
			}
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				this.socket.send(JSON.stringify({ type: 'input', input: 'down' }));
			}
		}
	};

	renderLoop = () => {
		if (this.latestState && !this.gameOver) {
			this.drawGameState(this.latestState);
		} else if (this.gameOver) {
			this.drawGameOver(this.gameOverMessage!.message, this.gameOverMessage!.winner);
		}
		requestAnimationFrame(this.renderLoop);
	}

	handleCanvasScaling = () => {
		const maxWidth = Math.min(window.innerWidth * 0.9, 1000); // 90% of window or max 1000px
		const maxHeight = Math.min(window.innerHeight * 0.9, 600); // 90% of window or max 600px

		let width = maxWidth;
		let height = width * 3 / 5;

		if (height > maxHeight) {
			height = maxHeight;
			width = height * 5 / 3;
		}

		this.canvas.width = Math.round(width);
		this.canvas.height = Math.round(height);
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
		this.ctx.fillRect(0, 0, width, height);
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
}