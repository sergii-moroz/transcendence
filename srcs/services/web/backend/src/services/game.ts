import crypto from 'crypto'
import { db } from '../db/connections.js'
import { GAME_MODES } from '../public/types/game-history.types.js';

export class Game {
	players: Map< string, {socket: WebSocket, id: string, username: string} >;
	state: {
		ball: { x: number; y: number; dx: number, dy: number},
		paddles: {
			player1: {y: number},
			player2: {y: number}
		},
		scores: { player1: number, player2: number, user1: string, user2: string },
		hit: boolean
	};
	standardBallSpeed: number;
	gameRoomId: string;
	gameRunning: boolean;
	winnerId: string | null;
	tournamentId: string | null;
	private game_mode: GAME_MODES = GAME_MODES.Multiplayer

	constructor(tournamentId: string | null = null) {
		this.tournamentId = tournamentId;
		this.players = new Map();
		this.standardBallSpeed = 4;
		this.state = {
			ball: { x: 0, y: 0, dx: 4, dy: 4 },
			paddles: {
				player1: { y: 0 },
				player2: { y: 0 }
			},
			scores: { player1: 0, player2: 0, user1: 'bing', user2: 'bong' },
			hit: false
		};
		this.winnerId = null;
		this.gameRoomId = crypto.randomBytes(16).toString('hex');
		this.gameRunning = false;
		this.game_mode = this.tournamentId ? GAME_MODES.Tournament : GAME_MODES.Multiplayer
	}

	addPlayer(socket: WebSocket, id: string, username: string) {
		const playerEntry = Array.from(this.players.entries()).find(([_, player]) => player.id === id);

		if (playerEntry) {
			const [role, player] = playerEntry;
			player.socket = socket;
			console.custom('INFO', `${this.gameRoomId}: Player ${id} reconnected as ${role}, socket updated`);
			return;
		}

		if (this.players.size === 0) {
			this.players.set('player1', {socket, id, username});
			this.state.scores.user1 = this.players.get('player1')!.username;
			console.custom('INFO', `${this.gameRoomId}: Player 1 joined`);
		}
		else if (this.players.size === 1) {
			this.players.set('player2', {socket, id, username});
			this.state.scores.user2 = this.players.get('player2')!.username;
			this.startLoop();
			console.custom('INFO', `${this.gameRoomId}: Player 2 joined`);
		}
		else {
			socket.send(JSON.stringify({
				type: 'Error',
				message: 'Game is full.'
			}));
			console.custom('ERROR', `${this.gameRoomId}: User tried to join a full game`);
			socket.close();
		}
	}

	removePlayer(player: WebSocket) {
		let winner;
		let loser;

		for (const [role, user] of this.players.entries()) {
			if (user.socket === player) {
				user.socket.close();
				loser = user;
			} else {
				user.socket.send(JSON.stringify({
					type: 'victory',
					message: `${user.username} wins!`,
					winner: role,
					tournamentId: this.tournamentId,
				}));
				winner = user;
			}
		}
		if(winner && loser)
			this.updateDatabase(winner, loser);
	}

	close(message?: string) {
		for (const [role, user] of this.players.entries()) {
			user.socket.send(JSON.stringify({
				type: 'closed',
				message: `${message ? message : "game was closed"}`
			}));
		}
	}

	startLoop() {
		this.gameRunning = true;
		const FIELD_X = 250, FIELD_Y = 150;
		const PADDLE_X1 = -FIELD_X + 10, PADDLE_X2 = FIELD_X - 10;
		const PADDLE_HEIGHT = 30;
		setInterval(() => {
			if(!this.gameRunning) return;
			this.state.hit = false
			this.state.ball.x += this.state.ball.dx;
			this.state.ball.y += this.state.ball.dy;

			// Ball collision with paddles (simplified)
			if (
				this.state.ball.x <= PADDLE_X1 &&
				Math.abs(this.state.ball.y - this.state.paddles.player1.y) < PADDLE_HEIGHT
			) {
				this.state.ball.dx *= -1;
				this.state.ball.dx *= 1.05; // Increase speed after hitting paddle
				this.state.ball.dy *= 1.05; // Increase speed after hitting paddle
				this.state.hit = true
			} else if (
				this.state.ball.x >= PADDLE_X2 &&
				Math.abs(this.state.ball.y - this.state.paddles.player2.y) < PADDLE_HEIGHT
			) {
				this.state.ball.dx *= -1;
				this.state.ball.dx *= 1.05; // Increase speed after hitting paddle
				this.state.ball.dy *= 1.05; // Increase speed after hitting paddle
				this.state.hit = true
			}

			// Ball collision with walls
			if (this.state.ball.y <= -FIELD_Y || this.state.ball.y >= FIELD_Y) {
				this.state.ball.dy *= -1;
				this.state.hit = true
			}

			// Scoring
			if (this.state.ball.x <= -FIELD_X + 5) {
				this.state.scores.player2++
				this.state.ball.dx = this.standardBallSpeed; // Reset ball speed
				this.state.ball.dy = this.standardBallSpeed; // Reset ball speed
				this.state.ball.x = PADDLE_X2 - 10;
				this.state.ball.y = this.state.paddles.player2.y
			}
			if (this.state.ball.x >= FIELD_X - 5) {
				this.state.scores.player1++
				this.state.ball.dx = this.standardBallSpeed; // Reset ball speed
				this.state.ball.dy = this.standardBallSpeed; // Reset ball speed
				this.state.ball.x = PADDLE_X1 + 10;
				this.state.ball.y = this.state.paddles.player1.y
			}

			this.players.forEach(player => {
				player.socket.send(JSON.stringify({
					type: 'gameState',
					state: this.state
				}));
			});

			this.checkScores();
		}, 16);
	}

	checkScores() {
		if (this.state.scores.player1 >= 7 || this.state.scores.player2 >= 7) {
			this.gameRunning = false;

			const winnerRole = this.state.scores.player1 >= 7 ? 'player1' : 'player2';
			const loserRole = winnerRole === 'player1' ? 'player2' : 'player1';
			const winner = this.players.get(winnerRole);
			const loser = this.players.get(loserRole);

			this.winnerId = winner?.id || null;

			// Send gameOver message
			if (winner) {
				winner.socket.send(JSON.stringify({
					type: 'victory',
					message: `${winnerRole === 'player1'
						? this.players.get('player1')!.username
						: this.players.get('player2')!.username} wins!`,
					winner: winnerRole,
					tournamentId: this.tournamentId, // Only winner gets tournamentId
				}));
			}
			if (loser) {
				loser.socket.send(JSON.stringify({
					type: 'defeat',
					message: `${winnerRole === 'player1'
						? this.players.get('player1')!.username
						: this.players.get('player2')!.username} wins!`,
					winner: winnerRole,
					tournamentId: null, // Loser does not get tournamentId
				}));
			}

			if (this.tournamentId) {
				console.custom('INFO', `Game room ${this.gameRoomId} in Tournament ${this.tournamentId}: ${winnerRole === 'player1' ? 'Player 1' : 'Player 2'} wins!`);
			} else {
				console.custom('INFO', `Game room ${this.gameRoomId}: ${winnerRole === 'player1' ? 'Player 1' : 'Player 2'} wins!`);
			}

			// Update stats
			if(winner && loser)
				this.updateDatabase(winner, loser);
		}
	}

	updateDatabase(winner: {socket: WebSocket, id: string, username: string}, loser: {socket: WebSocket, id: string, username: string}) {
		if(!this.tournamentId) {
			db.run(
				`UPDATE user_stats SET m_wins = m_wins + 1 WHERE user_id = ?`, [winner.id]
			);
			db.run(
				`UPDATE user_stats SET m_losses = m_losses + 1 WHERE user_id = ?`, [loser.id]
			);
			const gameResults = {
				gameId: this.gameRoomId,
				gameModeId: this.game_mode,
				player1Id: parseInt(this.players.get('player1')!.id),
				player2Id: parseInt(this.players.get('player2')!.id),
				score1: this.state.scores.player1,
				score2: this.state.scores.player2,
				duration: 42,
				techWin: false
			}
			saveGameResults(gameResults)
		} else {
			db.run(
				`UPDATE user_stats SET t_losses = t_losses + 1 WHERE user_id = ?`, [loser.id]
			);
		}
	}

	registerPlayerInput(input: string, connection: WebSocket) {
		if(!this.gameRunning) return;
		let player = '';
		for (const [role, user] of this.players.entries()) {
			if (user.socket === connection) {
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

interface GameProps {
	gameId: string
	gameModeId: number
	player1Id: number
	player2Id: number
	score1: number
	score2: number
	duration: number
	techWin?: boolean
}

export const saveGameResults = async (game: GameProps): Promise<void> => {
	return new Promise((resolve, reject) => {
		db.run(`
			INSERT INTO games (
				id,
				game_mode_id,
				player1,
				player2,
				score1,
				score2,
				tech_win,
				duration
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				game.gameId,
				game.gameModeId,
				game.player1Id,
				game.player2Id,
				game.score1,
				game.score2,
				game.techWin || false,
				game.duration
			],
			(err) => {
				if (err) return reject(err)
				resolve()
			}
		)
	})
}
