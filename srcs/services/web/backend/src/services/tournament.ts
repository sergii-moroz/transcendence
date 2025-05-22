import { FastifyInstance } from 'fastify';
import { Game } from './game.js';
import crypto from 'crypto';
import { redirectToGameRoom } from '../routes/v1/waitingRoom.js';

export class Tournament {
	games: Map<string, Game>;
	players: Array<[id: string, socket: WebSocket]>;
	eliminatedPlayers: number;
	allConnected: boolean;
	isRunning: boolean;
	id: string;
	app: FastifyInstance;

	constructor(app: FastifyInstance) {
		this.app = app;
		this.games = new Map();
		this.players = new Array();
		this.eliminatedPlayers = 0;
		this.allConnected = false;
		this.isRunning = false;
		this.id = crypto.randomBytes(16).toString('hex');
	}

	addPlayer(socket: WebSocket, id: string) {
		if(this.allConnected){
			for (let i = 0; i < this.players.length; i++) {
				if (this.players[i][0] === id) {
					this.players[i][1] = socket;
					console.custom('INFO', `Tournament: Player ${id} reconnected`);
				}
			}
			socket.send(JSON.stringify({
				type: 'Error',
				message: 'Tournament is full.'
			}));
			console.custom('ERROR', `Tournament: User ${id} tried to join a full tournament`);
		} else if(this.players.length !== 4) {
			this.players.push([id, socket]);
			console.custom('INFO', `Tournament: Player ${id} joined`);
		}
		if(this.players.length === 4 && !this.isRunning) {
			this.allConnected = true;
			this.startTournament();
		}
	}

	async matchPlayers() {
		while(this.isRunning) {
			if(this.players.length > 1) {
				const player1 = this.players.pop()!;
				const player2 = this.players.pop()!;

				const game = new Game(this.id);
				this.games.set(game.gameRoomId, game);
				this.app.gameInstances.set(game.gameRoomId, game);
				redirectToGameRoom(game.gameRoomId, this.app, new Map([player1, player2]));
				console.custom('INFO', `Tournament: Game room ${game.gameRoomId} created with players ${player1[0]} and ${player2[0]}`);
			}
		}
	}

	async detectWinners() {
		while(this.isRunning) {
			for (const game of this.games.values()) {
				if(game.winnerId) {
					this.eliminatedPlayers++;
					const winnerId = game.winnerId;
					const winner = game.players.get(winnerId);
					if(this.eliminatedPlayers === this.players.length - 1) {
						this.isRunning = false;
						this.app.tournaments.delete(this.id);
						console.custom('INFO', `Tournament: Tournament finished with winner ${winnerId}`);	
					}
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