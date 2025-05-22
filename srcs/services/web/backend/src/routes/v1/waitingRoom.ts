import {
	FastifyInstance,
	FastifyPluginOptions,
	FastifyRequest
} from "fastify"

import { Game } from "../../services/game.js";

export const waitingRoomSock = async (app: FastifyInstance) => {
    
    app.get('/waiting-room', {websocket: true }, async (socket, req) => {
		let userId: string = req.user.id.toString();

		socket.on('message', (messageBuffer: Event) => {
			const message = JSON.parse(messageBuffer.toString());

			if(message.type === 'joinRoom') {
				console.custom('INFO', `${userId} has joined the waiting room`);
				
				if(!app.waitingRoomConns.has(userId!)) {
					app.waitingRoomConns.set(userId!, socket);
				}
				else {
					app.waitingRoomConns.set(userId!, socket);
					console.custom('INFO', `${userId} is already in the waiting room`);
				}

				console.custom('INFO', 'Users in waiting room:', [...app.waitingRoomConns.keys()]);

				socket.send(JSON.stringify({
					type: 'joinedRoom',
					message: `You have joined waiting room`
				}));

				if (app.waitingRoomConns.size >= 2) {
					const game = new Game();
					app.gameInstances.set(game.gameRoomId, game);
					redirectToGameRoom(game.gameRoomId, app, app.waitingRoomConns);
					console.custom('INFO', 'Game started:', game.gameRoomId);
				}
			}
		})

		socket.on('close', () => {
			if (userId && app.waitingRoomConns.has(userId)) {
				app.waitingRoomConns.delete(userId);
			}
		})

		socket.on('error', (err: Event) => {
			console.custom('error', err);
		})
	});
}

export function redirectToGameRoom(gameRoomId: string, app: FastifyInstance, waitingRoomConns: Map<string, WebSocket>) {
	console.custom('INFO', 'Two users are in the waiting room, redirecting to game room...')

	const users = Array.from(waitingRoomConns).slice(0, 2);
	users.forEach((user) => waitingRoomConns.delete(user[0]));

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