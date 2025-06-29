import {
	FastifyInstance,
} from "fastify"

import { GAME_MODES } from "../../public/types/game-history.types.js";
import { Game } from "../../services/aiGame.js";

export const matchmakingSock = async (app: FastifyInstance) => {
	let matchmakingConns = new Array<[string, WebSocket]>();

	app.get('/matchmaking', {websocket: true }, async (socket, req) => {
		let userId: string = req.user.id.toString();

		connectUser(userId, socket);
		console.custom('INFO', 'Users in matchmaking queue:', matchmakingConns.map(([id]) => id));

		if (matchmakingConns.length >= 2) {
			matchPlayers(app, matchmakingConns);
		}

		socket.on('close', () => {
			handleClose(userId);
		})

		socket.on('error', (err: Event) => {
			handleError(err, userId);
		})
	});

	function connectUser(userId: string, socket: WebSocket) {
		const index = matchmakingConns.findIndex(([id]) => id === userId);
		if(index === -1) {
			matchmakingConns.push([userId, socket]);
			console.custom('INFO', `${userId} has joined the matchmaking queue`);
		} else {
			matchmakingConns[index][1] = socket;
			console.custom('INFO', `${userId} is already in the matchmaking queue, socket updated`);
		}
	}

	function matchPlayers(app: FastifyInstance, matchmakingConns: Array<[string, WebSocket]>) {
		const game = new Game(null, GAME_MODES.Multiplayer);
		app.gameInstances.set(game.gameRoomId, game);
		redirectToGameRoom(game.gameRoomId, matchmakingConns);
		console.custom('INFO', 'Game started:', game.gameRoomId);
	}

	function handleClose(userId: string) {
		const index = matchmakingConns.findIndex(([id]) => id === userId);
		if (index !== -1) {
			matchmakingConns.splice(index, 1);
			console.custom('INFO', `${userId} has left the matchmaking queue`);
		}
	}

	function handleError(err: Event, userId: string) {
		console.custom('error', err);
		handleClose(userId);
	}
}

export function redirectToGameRoom(gameRoomId: string, matchmakingConns: Array<[string, WebSocket]>) {
	const users = [];
	users.push(matchmakingConns.shift()!);
	users.push(matchmakingConns.shift()!);

	const message = JSON.stringify({
		type: 'redirectingToGame',
		gameRoomId: gameRoomId,
		message: `Redirecting to game room: ${gameRoomId}`
	});

	users.forEach((user) => {
		user[1].send(message);
	})

	console.custom('INFO', `Redirecting ${users[0][0]} and ${users[1][0]} to game room: ${gameRoomId}`);
}
