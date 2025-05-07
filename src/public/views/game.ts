import { View } from "../view.js"

import { gameJson, GameState } from "../types.js";

export class GameView extends View {
	canvas!: HTMLCanvasElement;
	ctx!: CanvasRenderingContext2D;
	gameRoomId!: string;

	setContent = (input: Record<string, any>) => {
		this.element.innerHTML = `
			<h2 id="score"></h2>
			<canvas id="game"></canvas>
			<button id="home-link">Home</button>
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

	handleSocket = (gameRoomId: string): WebSocket => {
		const socket = new WebSocket(`ws://localhost:4242/game/${gameRoomId}`);

		socket.onopen = () => {
			console.log('WebSocket connection established.');
		}

		socket.onmessage = (event) => {
			const data = JSON.parse(event.data) as gameJson;

			if (data.type === 'gameState') {
				this.drawGameState(data.state as GameState);
			}

			if (data.type === 'Error') {
				alert(data.message);
				console.error('WebSocket error:', data.message);
				if (socket && socket.readyState === WebSocket.OPEN) {
					socket.close();
					console.log('Disconnecting from socket...');
				}
				this.router.navigateTo('/home');
			}
		};

		socket.onclose = () => {
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.close();
				console.log('Disconnecting from socket...');
			}
			console.log('WebSocket connection closed.');
		};

		socket.onerror = (err: Event) => {
			alert(`WebSocket error: ${err}`);
			console.error('WebSocket error:', err);
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.close();
				console.log('Disconnecting from socket...');
			}
			this.router.navigateTo('/home');
		};

		return (socket);
	}

	setupEventListeners() {
		const socket: WebSocket = this.handleSocket(this.gameRoomId);
		this.addEventListener(document.getElementById('home-link')!, 'click', (e) => {
			e.preventDefault();
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.close();
				console.log('Disconnecting from socket...');
			}
			this.router.navigateTo('/home');
		});

		this.addEventListener(window, 'beforeunload', (e) => {
			e.preventDefault();
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.close();
				console.log('Disconnecting from socket, page unload...');
			}
		});

		this.addEventListener(document, 'keydown', (e: Event) => {
			if (e instanceof KeyboardEvent) {
				if (socket && socket.readyState === WebSocket.OPEN) {
					if (e.key === 'ArrowUp') {
						e.preventDefault();
						socket.send(JSON.stringify({ type: 'input', input: 'up' }));
					}
					if (e.key === 'ArrowDown') {
						e.preventDefault();
						socket.send(JSON.stringify({ type: 'input', input: 'down' }));
					}
				}
			}
		});
	}


	drawBall = (x: number, y: number) => {
		this.ctx.fillStyle = "#ff0000"
		this.ctx.beginPath()
		this.ctx.arc(x, y, 5, 0.0, 2.0 * Math.PI, false)
		this.ctx.closePath()
		this.ctx.fill()
	}

	clearField = (width: number, height: number) => {
		this.ctx.fillStyle = "#00ff00"
		this.ctx.fillRect(0, 0, width, height);
	}

	drawPaddle1 = (y: number) => {
		const w = 10
		const h = 60

		this.ctx.fillStyle = "#0000ff"
		this.ctx.fillRect(0, y - 0.5 * h, w, h)
	}

	drawPaddle2 = (y: number) => {
		const w = 10
		const h = 60

		this.ctx.fillStyle = "#ff00ff"
		this.ctx.fillRect(500 - w, y - 0.5 * h, w, h)
	}

	drawScore = (pos_x: number, pos_y: number, score: number) => {
		this.ctx.fillStyle = "#ffffff"
		this.ctx.font = "30px Arial"
		
		this.ctx.fillText(score.toString(), pos_x, pos_y)
	}

	drawGameState = (state: GameState) => {
		this.clearField(500, 300)
		this.drawScore(100, 100, state.scores.player1)
		this.drawScore(350, 100, state.scores.player2)
		this.drawPaddle1(state.paddles.player1.y)
		this.drawPaddle2(state.paddles.player2.y)
		this.drawBall(state.ball.x, state.ball.y)
	}
}