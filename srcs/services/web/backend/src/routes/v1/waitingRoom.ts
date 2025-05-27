import {
	FastifyInstance,
	FastifyPluginOptions,
	FastifyRequest
} from "fastify"

import { Game } from "../../services/game.js";

export const waitingRoomSock = async (app: FastifyInstance) => {
	let waitingRoomConns = new Array<[string, WebSocket]>();

	app.get('/waiting-room', {websocket: true }, async (socket, req) => {
		let userId: string = req.user.id.toString();

		socket.on('message', (messageBuffer: Event) => {
			const message = JSON.parse(messageBuffer.toString());

			if(message.type === 'joinRoom') {
				if(waitingRoomConns.findIndex(([id]) => id === userId) === -1) {
					waitingRoomConns.push([userId!, socket]);
					console.custom('INFO', `${userId} is now in the waiting room`);
				} else {
					waitingRoomConns.push([userId!, socket]);
					console.custom('INFO', `${userId} is already in the waiting room`);
				}

				console.custom('INFO', 'Users in waiting room:', [...waitingRoomConns.keys()]);

				socket.send(JSON.stringify({
					type: 'joinedRoom',
					message: `You have joined waiting room`
				}));

				if (waitingRoomConns.length >= 2) {
					const game = new Game();
					app.gameInstances.set(game.gameRoomId, game);
					redirectToGameRoom(game.gameRoomId, waitingRoomConns);
					console.custom('INFO', 'Game started:', game.gameRoomId);
				}
			}
		})

		socket.on('close', () => {
			const index = waitingRoomConns.findIndex(([id]) => id === userId);
			if (index !== -1) {
				waitingRoomConns.splice(index, 1);
			}
		})

		socket.on('error', (err: Event) => {
			console.custom('error', err);
		})
	});
}

export function redirectToGameRoom(gameRoomId: string, waitingRoomConns: Array<[string, WebSocket]>) {
	const users = [];
	users.push(waitingRoomConns.shift()!);
	users.push(waitingRoomConns.shift()!);

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