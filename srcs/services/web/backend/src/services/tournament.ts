import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { db } from '../db/connections.js';
import { GAME_MODES } from '../public/types/game-history.types.js';
import { Game } from './game.js';
import { clear } from 'console';

export class Tournament {
	games: Map<string, Game>;
	playerSockets: Map<string, {name: string, socket: WebSocket}>; // key: id, value: name/WebSocket
	knownPlayers: Map<string, {eliminated: boolean, name: string, redirectToGameId: string | null}>;
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
		this.playerSockets = new Map();
		this.knownPlayers = new Map();
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
		} else if(this.playerSockets.size !== this.maxPlayers) { // Add player
			this.playerSockets.set(id, {name, socket});
			this.sendMatchupData();
			console.custom('INFO', `Tournament: Player ${id} joined (${this.playerSockets.size}/4)`);
		} else if (this.playerSockets.size === this.maxPlayers) { // Forbid joining if full
			socket.send(JSON.stringify({
				type: 'Error',
				message: 'Tournament is full.'
			}));
			console.custom('ERROR', `Tournament: User ${id} tried to join a full tournament`);
		}
		if(this.playerSockets.size === this.maxPlayers && !this.isRunning) { // Start tournament if max players reached
			this.playerSockets.forEach((player, key) => {
				this.knownPlayers.set(key, {eliminated: false, name: player.name, redirectToGameId: null});
			});
			this.sendMatchupData();
			this.allConnected = true;
			console.custom('INFO', `Tournament: Starting tournament...`);
			this.startTournament();
		}
	}

	handleReconnect(socket: WebSocket, id: string, name: string) {
		if (this.knownPlayers.has(id) && this.knownPlayers.get(id)?.eliminated === false) {
			if(this.deleteTimeout) {
				clearTimeout(this.deleteTimeout);
			}

			this.playerSockets.set(id, {name, socket});

			this.sendMatchupData();
			console.custom('DEBUG', `Tournament: Player ${id} reconnected`);

			const redirectToGameId = this.knownPlayers.get(id)?.redirectToGameId;
			if (redirectToGameId && this.games.has(redirectToGameId) && this.games.get(redirectToGameId)?.winnerId === null) {
				socket.send(JSON.stringify({
					type: 'redirectToGame',
					gameRoomId: redirectToGameId,
					message: `Matched with opponent, proceed to game room...`
				}));
				console.custom('DEBUG', `Tournament: Player ${id} redirected to game room ${redirectToGameId}`);
			} 

			const remaining = Array.from(this.knownPlayers.entries()).filter(
				([_, info]) => !info.eliminated
			);
			console.custom('DEBUG', `Tournament: Remaining players after rejoin: ${remaining.map(([id]) => id).join(', ')}`);

			if (remaining.length === 1) {
				this.handleVictory(remaining[0][0]);
				return;
			}
			// if(this.playerSockets.size === remaining.length && this.activeGames == 0 && this.isRunning) {
			// 	console.custom('INFO', `Tournament: Starting next round...`);
			// 	this.startTournament();
			if (this.isRunning) {
				this.deleteTimeout = setTimeout(() => {
					if (this.playerSockets.size == 1){
						this.playerSockets.forEach((player, pid) => {
							this.handleVictory(pid);
							console.custom('INFO', `Tournament: tournament timeout, player ${pid} is the winner`);
						});
					} else {
						this.playerSockets.forEach((player, pid) => {
							player.socket.send(JSON.stringify({
								type: 'Error',
								message: `Tournament is inactive, stats will not be saved. Exiting...`,
								tournamentId: this.id
							}));
						});
						this.app.tournaments.delete(this.id);
						console.custom('INFO', `Tournament: Inactive tournament ${this.id} deleted`);
					}
				}, 120000); // 120 seconds of inactivity before deletion
			}
		} else if (this.knownPlayers.has(id) && this.knownPlayers.get(id)?.eliminated === true) {
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

	async handleVictory(finalWinnerId: string) {
		this.isRunning = false;
		console.custom('INFO', `Tournament: Tournament finished with winner ${finalWinnerId}`);
		const winnerSocket = this.playerSockets.get(finalWinnerId)?.socket;

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
		await new Promise(resolve => setTimeout(resolve, 200));
		this.app.tournaments.delete(this.id);
		return;
	}

	matchPlayers() {
		let advancingPlayers: Array<[string, string]>;

		advancingPlayers = Array.from(this.knownPlayers.entries())
			.filter(([_, info]) => !info.eliminated)
			.map(([id, info]) => {
				const player = this.knownPlayers.get(id);
				return player ? [id, info.name] as [string, string] : null;
			})
			.filter(Boolean) as Array<[string, string]>;

		while(this.isRunning && advancingPlayers.length > 1) {
			const player1 = advancingPlayers.shift()!;
			const player2 = advancingPlayers.shift()!;

			const game = new Game(this.id, GAME_MODES.Tournament);
			this.activeGames++;
			this.games.set(game.gameRoomId, game);
			this.app.gameInstances.set(game.gameRoomId, game);

			this.knownPlayers.set(player1[0], {eliminated: false, name: player1[1], redirectToGameId: game.gameRoomId});
			this.knownPlayers.set(player2[0], {eliminated: false, name: player2[1], redirectToGameId: game.gameRoomId});
			
			this.addReplaceMatchup(game, {id: player1[0], username: player1[1], score: 0}, {id: player2[0], username: player2[1], score: 0});
			this.sendMatchupData();
			this.informPlayersAboutNewGame(player1, player2, game.gameRoomId);

			console.custom('DEBUG', `Tournament: Game room ${game.gameRoomId} created with players ${player1[0]}:(${player1[1]}) and ${player2[0]}:(${player2[1]})`);
		}
	}

	informPlayersAboutNewGame(player1: [string, string], player2: [string, string], gameRoomId: string) {
		try {
			const players = [
				{id: player1[0], name: player1[1], gameSocket: this.playerSockets.get(player1[0])?.socket, socialSocket: this.app.onlineUsers.get(player1[1])},
				{id: player2[0], name: player2[1], gameSocket: this.playerSockets.get(player2[0])?.socket, socialSocket: this.app.onlineUsers.get(player2[1])}
			]

			for (let i = 0; i < players.length; i++) {
				const player = players[i];
				const opponent = players[1 - i];
				// console.custom('warn', `${player.name}'s opponent is ${opponent.name}`);

				if (player.socialSocket) {
					const message = {
						type: 'tournamentNextGame',
						opponentName: opponent.name,
						gameRoomId
					};
					player.socialSocket?.send(JSON.stringify(message));
				}
				
				const message = {
					type: 'redirectToGame',
					gameRoomId,
					opponentName: opponent.name,
					opponentId: opponent.id,
					message: `Redirecting to game room: ${gameRoomId}`
				};
				player.gameSocket?.send(JSON.stringify(message));
			}
		} catch (error) {
			console.custom('WARN', `Tournament: ${this.id}: Failed to send redirectToGame to game: ${gameRoomId}`);
		}
	}

	async detectWinners() {
		const interval = setInterval(() => {
			if (!this.isRunning || this.activeGames === 0) {
				clearInterval(interval);
				return;
			}
			for (const game of this.games.values()) {
				if (game.winnerId) {
					const winnerId = game.winnerId;
					let winnerSocket;
					let winnerName;
					// Mark all players in this game as eliminated except the winner
					for (const player of game.players.values()) {
						if (player.id !== winnerId) {
							this.knownPlayers.set(String(player.id), {eliminated: true, name: player.username, redirectToGameId: null}); // eliminated
							console.custom('DEBUG', `Eliminated: ${player.id}, knownPlayers: ${JSON.stringify(Array.from(this.knownPlayers.entries()))}`);
						} else {
							this.knownPlayers.set(String(player.id), {eliminated: false, name: player.username, redirectToGameId: null}); // not eliminated
							winnerSocket = player.socket;
							winnerName = player.username;
						}
					}
					this.addReplaceMatchup(game, null, null);
					this.sendMatchupData();
					this.activeGames--;
					this.games.delete(game.gameRoomId);
					this.app.gameInstances.delete(game.gameRoomId);
					if(this.activeGames === 0) {
						clearInterval(interval);
						console.custom('INFO', `Tournament: All games finished, starting next round...`);
						this.startTournament();
					}
				}
			}
		}, 500);
	}

	addReplaceMatchup(game: Game, 
		player1: {id: string, username: string, score: number} | null = null, 
		player2: {id: string, username: string, score: number} | null = null
	) {
		if (!player1) {
			const p1 = game.players.get('player1');
			player1 = p1
				? { id: p1.id, username: p1.username, score: game.state.scores.player1 }
				: { id: '', username: '', score: 0 };
		}
		if (!player2) {
			const p2 = game.players.get('player2');
			player2 = p2
				? { id: p2.id, username: p2.username, score: game.state.scores.player2 }
				: { id: '', username: '', score: 0 };
		}
		const newMatchup = {
			gameId: game.gameRoomId,
			round: this.round,
			p1: { id: player1.id, name: player1.username, score: game.state.scores.player1 },
			p2: { id: player2.id, name: player2.username, score: game.state.scores.player2 },
			winnerId: game.winnerId
		};

		const idx = this.matchups.findIndex(match => match.gameId === game.gameRoomId);
		if (idx !== -1) {
			this.matchups[idx] = newMatchup;
		} else {
			this.matchups.push(newMatchup);
		}
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
		this.playerSockets.forEach((player, key) => {
			player.socket.send(JSON.stringify({
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
