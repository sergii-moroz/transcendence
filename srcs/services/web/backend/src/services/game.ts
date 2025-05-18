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
			ball: { x: 0, y: 0, dx: 2, dy: 2 },
			paddles: {
				player1: { y: 0 },
				player2: { y: 0 }
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
				conn.close();
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
		const FIELD_X = 250, FIELD_Y = 150;
		const PADDLE_X1 = -FIELD_X + 10, PADDLE_X2 = FIELD_X - 10;
		const PADDLE_HEIGHT = 30;
		setInterval(() => {
			if(!this.gameRunning) return;
			this.state.ball.x += this.state.ball.dx;
			this.state.ball.y += this.state.ball.dy;
		
			// Ball collision with paddles (simplified)
			if (
                this.state.ball.x <= PADDLE_X1 &&
                Math.abs(this.state.ball.y - this.state.paddles.player1.y) < PADDLE_HEIGHT
            ) {
                this.state.ball.dx *= -1;
            } else if (
                this.state.ball.x >= PADDLE_X2 &&
                Math.abs(this.state.ball.y - this.state.paddles.player2.y) < PADDLE_HEIGHT
            ) {
                this.state.ball.dx *= -1;
            }
		
			// Ball collision with walls
			if (this.state.ball.y <= -FIELD_Y || this.state.ball.y >= FIELD_Y) {
				this.state.ball.dy *= -1;
			}

			// Scoring
			if (this.state.ball.x <= -FIELD_X + 5) {
				this.state.scores.player2++
				this.state.ball.x = PADDLE_X2 - 10;
				this.state.ball.y = this.state.paddles.player2.y
			}
			if (this.state.ball.x >= FIELD_X - 5) {
				this.state.scores.player1++
				this.state.ball.x = PADDLE_X1 + 10;
				this.state.ball.y = this.state.paddles.player1.y
			}

			this.players.forEach(player => {
				player.send(JSON.stringify({
					type: 'gameState',
					state: this.state
				}));
			});

			if(this.state.scores.player1 >= 2 || this.state.scores.player2 >= 2) {
				this.gameRunning = false;
				if(this.state.scores.player1 >= 2) {
					this.players.forEach(player => {
						player.send(JSON.stringify({
							type: 'gameOver',
							message: 'Player 1 wins!',
							winner: 'player1',
						}));
						// player.close();
					});
					// this.players.clear();
				} else {
					this.players.forEach(player => {
						player.send(JSON.stringify({
							type: 'gameOver',
							message: 'Player 2 wins!',
							winner: 'player2',
						}));
						// player.close();
					});
					// this.players.clear();
				}
			}
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
		const STEP = 20;
		const MIN_Y = -150 + 30, MAX_Y = 150 - 30;
		if (player == "player1") {
			if (input === 'up' && this.state.paddles.player1.y > MIN_Y) {
				this.state.paddles.player1.y -= STEP;
			} else if (input === 'down' && this.state.paddles.player1.y < MAX_Y) {
				this.state.paddles.player1.y += STEP;
			}
		}
		else if (player == "player2") {
			if (input === 'up' && this.state.paddles.player2.y > MIN_Y) {
				this.state.paddles.player2.y -= STEP;
			} else if (input === 'down' && this.state.paddles.player2.y < MAX_Y) {
				this.state.paddles.player2.y += STEP;
			}
		}
	}
}




