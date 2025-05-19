import { View } from "../view.js"

import { gameJson, GameState } from "../types.js";

export class GameView extends View {
	canvas!: HTMLCanvasElement;
	ctx!: CanvasRenderingContext2D;
	gameRoomId!: string;

	setContent = (input: Record<string, any>) => {
		this.element.innerHTML = `
		<div style="display: flex; flex-direction: column; align-items: center;">
			<h2 id="score"></h2>
			<canvas id="game"></canvas>
			<button id="home-link">Home</button>
		</div>
		`;
	}
	
	mount = async (parent: HTMLElement) => {
		parent.innerHTML = '';
		
		const input = await this.prehandler();
		this.setContent(input);
		parent.append(this.element);

		this.canvas = document.getElementById("game") as HTMLCanvasElement;
		this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		this.handleCanvasScaling();

		this.gameRoomId = window.location.pathname.split('/')[2];
		this.setupEventListeners();
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

	handleSocket = () => {
		this.socket = new WebSocket(`ws://localhost:4242/ws/game/${this.gameRoomId}`);

		this.socket.onopen = () => {
			console.log('WebSocket connection established.');
		}

		this.socket.onmessage = (event) => {
			const data = JSON.parse(event.data) as gameJson;

			if (data.type === 'gameState') {
				this.drawGameState(data.state as GameState);
			}

			if (data.type === 'Error') {
				alert(data.message);
				console.error('WebSocket error:', data.message);
				this.router.navigateTo('/home');
			}

			if (data.type === 'gameOver') {
				this.drawGameOver(data.message as string, data.winner as string);
				setTimeout(() => {
					this.router.navigateTo('/home');
					if(this.socket && this.socket.readyState === WebSocket.OPEN) {
						this.socket.close();
					}
				}, 3000);
			}
		};

		this.socket.onclose = () => {
			console.log("WebSocket connection got closed by server");
			this.router.navigateTo('/home');
		};

		this.socket.onerror = (err: Event) => {
			alert(`WebSocket error: ${err}`);
			console.error('WebSocket error:', err);
			this.router.navigateTo('/home');
		};
	}

	setupEventListeners() {
		this.handleSocket();
		this.addEventListener(document.getElementById('home-link')!, 'click', (e) => {
			e.preventDefault();
			if(this.socket && this.socket.readyState === WebSocket.OPEN) {
				this.socket.close();
				console.log('Disconnecting from socket, going home...');
			}
			this.router.navigateTo('/home');
		});

		this.addEventListener(window, 'beforeunload', (e) => {
			e.preventDefault();
			if (this.socket && this.socket.readyState === WebSocket.OPEN) {
				this.socket.close();
				console.log('Disconnecting from socket, page unload...');
			}
		});

		this.addEventListener(document, 'keydown', (e: Event) => {
			if (e instanceof KeyboardEvent) {
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
			}
		});

		this.addEventListener(window, 'resize', this.handleCanvasScaling);
	}

	logicalToCanvasX(x: number): number {
		return (x + 250) / 500 * this.canvas.width;
	}

	logicalToCanvasY(y: number): number {
		return (y + 150) / 300 * this.canvas.height;
	}


	drawBall = (x: number, y: number) => {
		let radius = this.canvas.width / 100;
		this.ctx.fillStyle = "#ffffff"
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

	drawScore = (pos_x: number, pos_y: number, score: number) => {
		this.ctx.fillStyle = "#bfbfbf"
		this.ctx.font = "30px Arial"
		
		this.ctx.fillText(score.toString(), pos_x, pos_y)
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
		this.ctx.font = "bold 40px Arial";
		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "middle";
		this.ctx.fillText(message, (this.canvas.width / 2), this.canvas.height / 2);
		this.ctx.font = "15px Arial";
		this.ctx.fillText(`Redirecting to home in 3 seconds`, (this.canvas.width / 2), (this.canvas.height / 2) + 30);
	}

	drawGameState = (state: GameState) => {
		let score1_x = (this.canvas.width / 5);
		let score2_x = this.canvas.width - (this.canvas.width / 5);
		let score_y = (this.canvas.height / 3);

		this.clearField(this.canvas.width, this.canvas.height)
		this.drawScore(score1_x, score_y, state.scores.player1)
		this.drawScore(score2_x, score_y, state.scores.player2)
		this.drawPaddle1(this.logicalToCanvasY(state.paddles.player1.y))
		this.drawPaddle2(this.logicalToCanvasY(state.paddles.player2.y))
		this.drawBall(this.logicalToCanvasX(state.ball.x), this.logicalToCanvasY(state.ball.y))
	}
}