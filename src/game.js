import crypto from 'crypto'
import fastifyWebsocket from '@fastify/websocket';

export class Game {
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
		this.gameStarted = false;
	}

	addPlayer(player) {
		//if(player instanceof fastifyWebsocket) {
			if (this.players.size === 0) {
				this.players.set('player1', player);
				console.log('Player 1 joined');
			}
			else if (this.players.size === 1) {
				this.players.set('player2', player);
				this.startLoop();
				console.log('Player 2 joined');
			}
			else {
				player.send(JSON.stringify({
					type: 'Error',
					message: 'Game is full.'
				}));
			}
		//}
		//else {
		//	throw new Error('Invalid player type');
		//}
	}

	removePlayer(player) {
		for (const [role, conn] of this.players.entries()) {
			if (conn === player) {
				this.players.delete(role);
			} else {
				conn.send(JSON.stringify({
					type: 'Error',
					message: 'Game ended, other player left'
				}));
			}
		}
	}

	startLoop() {
		this.gameStarted = true;
		setInterval(() => {
			// Update ball position
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
			this.players.forEach(player => {
				player.send(JSON.stringify({
					type: 'gameState',
					state: this.state
				}));
			});
		}, 16);
	}

	registerPlayerInput(input, connection) {
		if(!this.gameStarted) return;
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




