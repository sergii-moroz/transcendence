import { FastifyInstance } from 'fastify';
import { Game } from './game.js';
import crypto from 'crypto';
import { redirectToGameRoom } from '../routes/v1/waitingRoom.js';

export class Tournament {
	games: Map<string, Game>;
	players: Array<[id: string, socket: WebSocket]>;
	knownIds: Map<string, boolean>;
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
				this.players.push([id, socket]);
				console.custom('INFO', `Tournament: Player ${id} reconnected`);
				if(this.players.length > 1 && this.isRunning) {
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
							this.knownIds.set(player.id, true); // eliminated
						}
					}
					// Only push the winner if not already eliminated
					if (!this.knownIds.get(winnerId)) {
						const winnerEntry = Array.from(game.players.values()).find(p => p.id === winnerId);
						if (winnerEntry) {
							this.players.push([winnerId, winnerEntry.socket]);
							console.custom('INFO', `Tournament: Game room ${game.gameRoomId} finished with winner ${winnerId}`);
						} else {
							console.custom('ERROR', `Tournament: Could not find winner socket for user ${winnerId}`);
						}
					}
					this.games.delete(game.gameRoomId);

					// Check if only one player remains not eliminated
					const remaining = Array.from(this.knownIds.entries()).filter(([_, eliminated]) => !eliminated);
					if (remaining.length === 1) {
						const [finalWinnerId] = remaining[0];
						this.isRunning = false;
						this.app.tournaments.delete(this.id);
						console.custom('INFO', `Tournament: Tournament finished with winner ${finalWinnerId}`);
						clearInterval(interval);
						return;
					}

					if (this.players.length > 1)
						this.matchPlayers();
				}
			}
		}, 500);
	}

	async startTournament() {
		this.isRunning = true;
		await this.matchPlayers();
		console.custom('INFO', `Tournament: Players matched, waiting for games to finish...`);
		this.detectWinners();
	}
}