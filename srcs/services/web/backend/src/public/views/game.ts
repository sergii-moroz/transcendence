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
		this.canvas.width = 500;
		this.canvas.height = 300;

		this.gameRoomId = window.location.pathname.split('/')[2];
		this.setupEventListeners();
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
	}

	logicalToCanvasX(x: number): number {
		return (x + 250);
	}

	logicalToCanvasY(y: number): number {
		return (y + 150);
	}


	drawBall = (x: number, y: number) => {
		this.ctx.fillStyle = "#ffffff"
		this.ctx.beginPath()
		this.ctx.arc(x, y, 5, 0.0, 2.0 * Math.PI, false)
		this.ctx.closePath()
		this.ctx.fill()
	}

	clearField = (width: number, height: number) => {
		this.ctx.fillStyle = "#393f3f"
		this.ctx.fillRect(0, 0, width, height);
	}

	drawPaddle1 = (y: number) => {
		const w = 10
		const h = 60

		this.ctx.fillStyle = "#02a5f7"
		this.ctx.fillRect(0, y - 0.5 * h, w, h)
	}

	drawPaddle2 = (y: number) => {
		const w = 10
		const h = 60

		this.ctx.fillStyle = "#f7026a"
		this.ctx.fillRect(500 - w, y - 0.5 * h, w, h)
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
		this.ctx.fillRect(0, 0, 500, 300);
		this.ctx.fillStyle = "#ffffff";
		this.ctx.font = "bold 40px Arial";
		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "middle";
		this.ctx.fillText(message, 250, 130);
		this.ctx.font = "15px Arial";
		this.ctx.fillText(`Redirecting to home in 3 seconds`, 250, 170);
	}

	drawGameState = (state: GameState) => {
		this.clearField(500, 300)
		this.drawScore(100, 100, state.scores.player1)
		this.drawScore(350, 100, state.scores.player2)
		this.drawPaddle1(this.logicalToCanvasY(state.paddles.player1.y))
		this.drawPaddle2(this.logicalToCanvasY(state.paddles.player2.y))
		this.drawBall(this.logicalToCanvasX(state.ball.x), this.logicalToCanvasY(state.ball.y))
	}
}