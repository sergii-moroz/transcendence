import crypto from 'crypto'

export class Game {
	players: Map< string, WebSocket >;
	state: {
		ball: { x: number; y: number; dx: number, dy: number},
		paddles: {
			player1: {y: number},
			player2: {y: number}
		},
		scores: { player1: number, player2: number}
	};
	gameRoomId: string;
	gameRunning: boolean;

	constructor() {
		this.players = new Map();
		this.state = {
			ball: { x: 50, y: 50, dx: 1, dy: 1 },
			paddles: {
				player1: { y: 50 },
				player2: { y: 50 }
			},
			scores: { player1: 0, player2: 0 }
		};
		this.gameRoomId = crypto.randomBytes(16).toString('hex');
		this.gameRunning = false;
	}

	addPlayer(player: WebSocket) {
		if (this.players.size === 0) {
			this.players.set('player1', player);
			console.custom('INFO', `${this.gameRoomId}: Player 1 joined`);
		}
		else if (this.players.size === 1) {
			this.players.set('player2', player);
			this.startLoop();
			console.custom('INFO', `${this.gameRoomId}: Player 2 joined`);
		}
		else {
			player.send(JSON.stringify({
				type: 'Error',
				message: 'Game is full.'
			}));
			console.custom('ERROR', `${this.gameRoomId}: User tried to join a full game`);
			player.close();
		}
	}

	removePlayer(player: WebSocket) {
		for (const [role, conn] of this.players.entries()) {
			if (conn === player) {
				this.players.delete(role);
			} else {
				conn.send(JSON.stringify({
					type: 'gameOver',
					message: 'Game ended, other player left, you win!',
					winner: role,
				}));
				conn.close();
				this.players.delete(role);
			}
		}
	}

	startLoop() {
		this.gameRunning = true;
		setInterval(() => {
			if(!this.gameRunning) return;
			this.state.ball.x += this.state.ball.dx;
			this.state.ball.y += this.state.ball.dy;
		
			// Ball collision with paddles (simplified)
			if (this.state.ball.x == (10+5) && Math.abs(this.state.ball.y - this.state.paddles.player1.y) < 30) {
				this.state.ball.dx *= -1
			} else if (this.state.ball.x == (500-10-5) && Math.abs(this.state.ball.y - this.state.paddles.player2.y) < 30) {
				this.state.ball.dx *= -1
			}
		
			// Ball collision with walls
			if (this.state.ball.y <= 5 || this.state.ball.y >= (300-5)) {
				this.state.ball.dy *= -1;
			}
			if (this.state.ball.x <= 5) {
				this.state.scores.player2++
				this.state.ball.x = (500-10-5)
				this.state.ball.y = this.state.paddles.player2.y
				// this.state.ball.dx *= -1;
			}
			if (this.state.ball.x >= (500-5)) {
				this.state.scores.player1++
				this.state.ball.x = (10+5)
				this.state.ball.y = this.state.paddles.player1.y
				// this.state.ball.dx *= -1;
			}

			if(this.state.scores.player1 >= 7 || this.state.scores.player2 >= 7) {
				this.gameRunning = false;
				if(this.state.scores.player1 >= 7) {
					this.players.forEach(player => {
						player.send(JSON.stringify({
							type: 'gameOver',
							message: 'Player 1 wins!',
							winner: 'player1',
						}));
						player.close();
					});
					this.players.clear();
				}
			}

			this.players.forEach(player => {
				player.send(JSON.stringify({
					type: 'gameState',
					state: this.state
				}));
			});
		}, 16);
	}

	registerPlayerInput(input: string, connection: WebSocket) {
		if(!this.gameRunning) return;
		let player = '';
		for (const [role, conn] of this.players.entries()) {
			if (conn === connection) {
				player = role;
			}
		}
		if (player == "player1") {
			if (input === 'up' && this.state.paddles.player1.y > 30) {
				this.state.paddles.player1.y -= 10;
			} else if (input === 'down' && this.state.paddles.player1.y < (300-30)) {
				this.state.paddles.player1.y += 10;
			}
		}
		else if (player == "player2") {
			if (input === 'up' && this.state.paddles.player2.y > 30) {
				this.state.paddles.player2.y -= 10;
			} else if (input === 'down' && this.state.paddles.player2.y < (300-30)) {
				this.state.paddles.player2.y += 10;
			}
		}
	}
}




