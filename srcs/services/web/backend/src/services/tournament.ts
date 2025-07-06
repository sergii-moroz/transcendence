import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { redirectToGameRoom } from '../routes/v1/matchmaking.js';
import { db } from '../db/connections.js';
import { GAME_MODES } from '../public/types/game-history.types.js';
import { Game } from './game.js';

export class Tournament {
	games: Map<string, Game>;
	players: Array<[id: string, name: string, socket: WebSocket]>;
	knownIds: Map<string, {eliminated: boolean, redirectToGameId: string | null}>;
	allConnected: boolean;
	activeGames: number;
	isRunning: boolean;
	id: string;
	maxPlayers: number;
	app: FastifyInstance;
	deleteTimeout: NodeJS.Timeout | null = null;
	round: number = 0;
	matchups: Array<{
		gameId: string,
		round: number,
		p1:{id: string, name: string, score: number},
		p2:{id: string, name: string, score: number},
		winnerId: string | null
	}>

	constructor(app: FastifyInstance, maxPlayers: number) {
		this.app = app;
		this.id = crypto.randomBytes(16).toString('hex');

		this.games = new Map();
		this.players = new Array();
		this.knownIds = new Map();
		this.matchups = new Array();
		
		this.allConnected = false;
		this.isRunning = false;
		
		this.activeGames = 0;
		this.maxPlayers = maxPlayers || 4;
	}

	addPlayer(socket: WebSocket, id: string, name: string) {
		if(this.allConnected){
			this.handleReconnect(socket, id, name);
			return;
		} else if(this.players.length !== this.maxPlayers) { // Add player
			this.players = this.players.filter(([pid]) => pid !== id);
			this.players.push([id, name, socket]);
			console.custom('INFO', `Tournament: Player ${id} joined (${this.players.length}/4)`);
		} else if (this.players.length === this.maxPlayers) { // Forbid joining if full
			socket.send(JSON.stringify({
				type: 'Error',
				message: 'Tournament is full.'
			}));
			console.custom('ERROR', `Tournament: User ${id} tried to join a full tournament`);
		}
		if(this.players.length === this.maxPlayers && !this.isRunning) { // Start tournament if max players reached
			this.players.forEach(([pid, name, playerSocket]) => {
				this.knownIds.set(pid, {eliminated: false, redirectToGameId: null});
			});
			this.sendMatchupData();
			this.allConnected = true;
			console.custom('INFO', `Tournament: Starting tournament...`);
			this.startTournament();
		}
	}

	handleReconnect(socket: WebSocket, id: string, name: string) {
		if (this.knownIds.has(id) && this.knownIds.get(id)?.eliminated === false) {
			if(this.deleteTimeout) {
				clearTimeout(this.deleteTimeout);
			}

			this.players = this.players.filter(([pid]) => pid !== id);
			this.players.push([id, name, socket]);

			this.sendMatchupData();
			console.custom('DEBUG', `Tournament: Player ${id} reconnected`);

			const redirectToGameId = this.knownIds.get(id)?.redirectToGameId;
			if (redirectToGameId && this.games.has(redirectToGameId) && this.games.get(redirectToGameId)?.winnerId === null) {
				socket.send(JSON.stringify({
					type: 'redirectToGame',
					gameRoomId: redirectToGameId,
					message: `Matched with opponent, proceed to game room...`
				}));
				console.custom('DEBUG', `Tournament: Player ${id} redirected to game room ${redirectToGameId}`);
			}

			const remaining = Array.from(this.knownIds.entries()).filter(
				([_, info]) => !info.eliminated
			);
			console.custom('DEBUG', `Tournament: Remaining players after rejoin: ${remaining.map(([id]) => id).join(', ')}`);

			if (remaining.length === 1) {
				this.handleVictory(remaining[0][0]);
				return;
			}
			if(this.players.length === remaining.length && this.activeGames == 0 && this.isRunning) {
				console.custom('INFO', `Tournament: Starting next round...`);
				this.startTournament();
			} else if (this.isRunning) {
				this.deleteTimeout = setTimeout(() => {
					if (this.players.length == 1){
						this.players.forEach(([pid, playerSocket]) => {
							this.handleVictory(pid);
						});
					} else {
						this.players.forEach(([pid, name, playerSocket]) => {
							playerSocket.send(JSON.stringify({
								type: 'Error',
								message: `Tournament is inactive, stats will not be saved. Exiting...`,
								tournamentId: this.id
							}));
						});
						this.app.tournaments.delete(this.id);
						console.custom('INFO', `Tournament: Inactive tournament ${this.id} deleted`);
					}
				}, 90000); // 90 seconds of inactivity before deletion
			}
		} else if (this.knownIds.has(id) && this.knownIds.get(id)?.eliminated === true) {
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
	}

	handleVictory(finalWinnerId: string) {
		this.isRunning = false;
		console.custom('INFO', `Tournament: Tournament finished with winner ${finalWinnerId}`);
		const winnerSocket = this.players.find(([id]) => id === finalWinnerId)?.[2];

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

	async matchPlayers() {
		let advancingPlayers: Array<[string, string, WebSocket]>;
		if (this.round === 1) {
			advancingPlayers = [...this.players];
		} else {
			const prevRound = this.round - 1;
			const winnerIds = this.matchups
				.filter(m => m.round === prevRound && m.winnerId)
				.map(m => m.winnerId!);
			advancingPlayers = winnerIds
				.map(wid => this.players.find(([id]) => id === wid))
				.filter(Boolean) as Array<[string, string, WebSocket]>;
		}
		while(this.isRunning && advancingPlayers.length > 1) {
			const player1 = advancingPlayers.shift()!;
			const player2 = advancingPlayers.shift()!;

			const game = new Game(this.id, GAME_MODES.Tournament);
			this.activeGames++;
			this.games.set(game.gameRoomId, game);
			this.app.gameInstances.set(game.gameRoomId, game);

			await new Promise(resolve => setTimeout(resolve, 50));
			
			this.redirectToGameRoom(game.gameRoomId, player1, player2);
			this.knownIds.set(player1[0], {eliminated: false, redirectToGameId: game.gameRoomId});
			this.knownIds.set(player2[0], {eliminated: false, redirectToGameId: game.gameRoomId});
			console.custom('DEBUG', `Tournament: Game room ${game.gameRoomId} created with players ${player1[0]} and ${player2[0]}`);
		}
	}

	redirectToGameRoom(gameRoomId: string, player1: [string, string, WebSocket], player2: [string, string, WebSocket]) {
		const message1 = JSON.stringify({
			type: 'redirectToGame',
			gameRoomId: gameRoomId,
			opponentName: player2[1],
			opponentId: player2[0],
			message: `Redirecting to game room: ${gameRoomId}`
		});

		const message2 = JSON.stringify({
			type: 'redirectToGame',
			gameRoomId: gameRoomId,
			opponentName: player1[1],
			opponentId: player1[0],
			message: `Redirecting to game room: ${gameRoomId}`
		});

		player1[2].send(message1);
		player2[2].send(message2);
	}

	async detectWinners() {
		const interval = setInterval(() => {
			if (!this.isRunning) {
				clearInterval(interval);
				return;
			}
			for (const game of this.games.values()) {
				if (game.winnerId) {
					const winnerId = game.winnerId;
					// Mark all players in this game as eliminated except the winner
					for (const player of game.players.values()) {
						if (player.id !== winnerId) {
							this.knownIds.set(String(player.id), {eliminated: true, redirectToGameId: null}); // eliminated
							console.custom('DEBUG', `Eliminated: ${player.id}, knownIds: ${Array.from(this.knownIds.entries())}`);
						} else {
							this.knownIds.set(String(player.id), {eliminated: false, redirectToGameId: null}); // not eliminated
						}
					}
					this.addMatchup(game);
					this.sendMatchupData();
					this.activeGames--;
					this.games.delete(game.gameRoomId);
					this.app.gameInstances.delete(game.gameRoomId);
				}
			}
		}, 500);
	}

	addMatchup(game: Game) {
		const player1 = game.players.get('player1')!;
		const player2 = game.players.get('player2')!;
		this.matchups.push({
			gameId: game.gameRoomId,
			round: this.round,
			p1: { id: player1.id, name: player1.username, score: game.state.scores.player1 },
			p2: { id: player2.id, name: player2.username, score: game.state.scores.player2 },
			winnerId: game.winnerId
		});
		console.custom('DEBUG', `Tournament: Matchup added for game ${game.gameRoomId} in round ${this.round}`);
	}

	sendMatchupData() {
		const matchupData = this.matchups.length > 0
		? this.matchups.map(match => ({
			gameId: match.gameId,
			round: match.round,
			p1: match.p1,
			p2: match.p2,
			winnerId: match.winnerId
		}))
		: null;
		this.players.forEach(([id, name, socket]) => {
			socket.send(JSON.stringify({
				type: 'matchupData',
				tournamentId: this.id,
				matchups: matchupData ,
				maxPlayers: this.maxPlayers,
			}));
		});
		console.custom('DEBUG', `Tournament: Matchup data sent to players, total matchups: ${this.matchups.length}`);
	}

	async startTournament() {
		this.isRunning = true;
		this.round++;
		this.matchPlayers();
		console.custom('DEBUG', `Tournament: Players matched, waiting for games to finish...`);
		this.detectWinners();
	}
}
