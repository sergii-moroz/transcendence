import {
	FastifyInstance,
	FastifyPluginOptions,
	FastifyRequest
} from "fastify"

import { Game } from "../../services/game.js";

export const waitingRoomSock = async (app: FastifyInstance) => {
    
    app.get('/waiting-room', {websocket: true }, async (socket, req) => {
		let userName: string = req.user.username;

		socket.on('message', (messageBuffer: Event) => {
			const message = JSON.parse(messageBuffer.toString());

			if(message.type === 'joinRoom') {
				console.custom('INFO', `${userName} has joined the waiting room`);
				
				if(!app.waitingRoomConns.has(userName!)) {
					app.waitingRoomConns.set(userName!, socket);
				}
				else {
					console.custom('INFO', `${userName} is already in the waiting room`);
				}

				console.custom('INFO', 'Users in waiting room:', [...app.waitingRoomConns.keys()]);

				socket.send(JSON.stringify({
					type: 'joinedRoom',
					message: `You have joined waiting room`
				}));

				if (app.waitingRoomConns.size >= 2) {
					const game = new Game();
					app.gameInstances.set(game.gameRoomId, game);
					redirectToGameRoom(game.gameRoomId, app);
					app.gameInstances.get(game.gameRoomId).startLoop();
					console.custom('INFO', 'Game started:', game.gameRoomId);
				}
			}
		})

		socket.on('close', () => {
			if (userName && app.waitingRoomConns.has(userName)) {
				app.waitingRoomConns.delete(userName);
			}
		})

		socket.on('error', (err: Event) => {
			console.custom('error', err);
		})
	});
}

function redirectToGameRoom(gameRoomId: string, app: FastifyInstance) {
	console.custom('INFO', 'Two users are in the waiting room, redirecting to game room...')

	const users = Array.from(app.waitingRoomConns).slice(0, 2);
	users.forEach((user) => app.waitingRoomConns.delete(user[0]));

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