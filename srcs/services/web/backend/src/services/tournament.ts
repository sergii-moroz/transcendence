import { FastifyInstance } from 'fastify';
import { Game } from './game.js';
import crypto from 'crypto';
import { redirectToGameRoom } from '../routes/v1/waitingRoom.js';
import { db } from '../db/connections.js';

export class Tournament {
	games: Map<string, Game>;
	players: Array<[id: string, socket: WebSocket]>;
	knownIds: Map<string, boolean>; // true = eliminated, false = not eliminated
	allConnected: boolean;
	isRunning: boolean;
	id: string;
	app: FastifyInstance;

	constructor(app: FastifyInstance) {
		this.app = app;
		this.games = new Map();
		this.players = new Array();
		this.knownIds = new Map();
		this.allConnected = false;
		this.isRunning = false;
		this.id = crypto.randomBytes(16).toString('hex');
	}

	addPlayer(socket: WebSocket, id: string) {
		if(this.allConnected){
			if (this.knownIds.has(id) && this.knownIds.get(id) === false) {
				this.players = this.players.filter(([pid]) => pid !== id);
				this.players.push([id, socket]);
				console.custom('INFO', `Tournament: Player ${id} reconnected`);

				console.custom('DEBUG', 'knownIds before remaining:', Array.from(this.knownIds.entries()));
				const remaining = Array.from(this.knownIds.entries()).filter(([_, eliminated]) => !eliminated);
				console.custom('INFO', `Tournament: Remaining players after rejoin: ${remaining.map(([id]) => id).join(', ')}`);
				if (remaining.length === 1) {
					const [finalWinnerId] = remaining[0];
					console.custom('INFO', `Tournament: Tournament finished with winner ${finalWinnerId}`);
					this.isRunning = false;
					const winnerSocket = this.players.find(([id]) => id === finalWinnerId)?.[1];
					if (winnerSocket) {
						winnerSocket.send(JSON.stringify({
							type: 'victory',
							message: `Congratulations! You have won the tournament!`,
							winnerId: finalWinnerId,
							tournamentId: this.id
						}));
					}
					db.run(
							`UPDATE user_stats SET t_wins = t_wins + 1 WHERE user_id = ?`, [finalWinnerId]
					);
					this.app.tournaments.delete(this.id);
					return;
				}

				if(this.isRunning) {
					console.custom('INFO', `Tournament: Starting next round...`);
					this.startTournament();
				}
			} else if (this.knownIds.has(id) && this.knownIds.get(id) === true) {
				socket.send(JSON.stringify({
					type: 'Error',
					message: 'You have been eliminated.'
				}));
				console.custom('ERROR', `Tournament: User ${id} tried to rejoin after elimination`);
		 	} else {
				socket.send(JSON.stringify({
					type: 'Error',
					message: 'Tournament is full.'
				}));
				console.custom('ERROR', `Tournament: User ${id} tried to join a full tournament`);
			}
		} else if(this.players.length !== 4) { // Add player
			this.players.push([id, socket]);
			this.knownIds.set(id, false);
			console.custom('INFO', `Tournament: Player ${id} joined (${this.players.length}/4)`);
		} else if (this.players.length === 4) { // Forbid joining if full
			socket.send(JSON.stringify({
				type: 'Error',
				message: 'Tournament is full.'
			}));
			console.custom('ERROR', `Tournament: User ${id} tried to join a full tournament`);
		}
		if(this.players.length === 4 && !this.isRunning) { // Start tournament if 4 players are connected
			this.allConnected = true;
			console.custom('INFO', `Tournament: Starting tournament...`);
			this.startTournament();
		}
	}

	async matchPlayers() {
		while(this.isRunning && this.players.length > 1) {
			const player1 = this.players.shift()!;
			const player2 = this.players.shift()!;

			const game = new Game(this.id);
			this.games.set(game.gameRoomId, game);
			this.app.gameInstances.set(game.gameRoomId, game);

			await new Promise(resolve => setTimeout(resolve, 50));
			
			redirectToGameRoom(game.gameRoomId, [player1, player2]);
			console.custom('INFO', `Tournament: Game room ${game.gameRoomId} created with players ${player1[0]} and ${player2[0]}`);
		}
	}

	async detectWinners() {
		const interval = setInterval(() => {
			if (!this.isRunning || this.games.size === 0) {
				clearInterval(interval);
				return;
			}
			for (const game of this.games.values()) {
				if (game.winnerId) {
					const winnerId = game.winnerId;
					// Mark all players in this game as eliminated except the winner
					for (const player of game.players.values()) {
						if (player.id !== winnerId) {
							this.knownIds.set(String(player.id), true); // eliminated
							console.custom('DEBUG', `Eliminated: ${player.id}, knownIds: ${Array.from(this.knownIds.entries())}`);
						}
					}
					this.games.delete(game.gameRoomId);
					this.app.gameInstances.delete(game.gameRoomId);
				}
			}
		}, 500);
	}

	async startTournament() {
		this.isRunning = true;
		// Check if the winner has not been found yet
		await this.matchPlayers();
		console.custom('INFO', `Tournament: Players matched, waiting for games to finish...`);
		this.detectWinners();
	}
}