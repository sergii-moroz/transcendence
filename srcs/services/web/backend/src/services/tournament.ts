import { Game } from './game.js';

export class Tournament {
	games: Map<string, Game>;
	players: Array<[id: string, socket: WebSocket]>;
	allConnected: boolean;
	isRunning: boolean;

	constructor() {
		this.games = new Map();
		this.players = new Array();
		this.allConnected = false;
		this.isRunning = false;
	}

	addPlayer(socket: WebSocket, id: string) {
		if(this.players.length !== 4) {
			this.players.push([id, socket]);
			console.custom('INFO', `Tournament: Player ${id} joined`);
		}
		if(this.players.length === 4) {
			this.allConnected = true;
			this.startTournament();
		}
	}

	async matchPlayers() {
		while(this.isRunning) {
			if(this.players.length > 1) {
				const player1 = this.players.pop()!;
				const player2 = this.players.pop()!;

				const game = new Game();
				this.games.set(game.gameRoomId, game);
				game.addPlayer(player1[1], player1[0]);
				game.addPlayer(player2[1], player2[0]);
				game.startLoop();
				console.custom('INFO', `Tournament: Game room ${game.gameRoomId} created with players ${player1[0]} and ${player2[0]}`);
			}
		}
	}

	async detectWinners() {
		while(this.isRunning) {
			for (const game of this.games.values()) {
				if(game.winner) {
					const winnerId = game.winner;
					const winner = game.players.get(winnerId);
					this.players.push([winnerId, winner!.socket]);
					console.custom('INFO', `Tournament: Game room ${game.gameRoomId} finished with winner ${winner}`);
				}
			}
		}

	}

	startTournament() {
		this.isRunning = true;
		this.matchPlayers();
		this.detectWinners();
	}
}