import {
	FastifyInstance,
	FastifyPluginOptions,
	FastifyRequest
} from "fastify"

import { authenticate} from "../../services/authService.js";


import { Game } from "../../services/game.js";

export const waitingRoomSock = async (app: FastifyInstance) => {
    
    app.get('/waiting-room', {websocket: true }, async (connection: WebSocket, req: FastifyRequest) => {
		let userName: string | null = null;
		const socket = connection;

		socket.onmessage = (messageBuffer) => {
			const message = JSON.parse(messageBuffer.toString());

			if(message.type === 'joinRoom') {
				userName = message.username;
				console.log(`${userName} has joined the waiting room`);
				
				if(!app.waitingRoomConns.has(userName!)) {
					app.waitingRoomConns.set(userName!, connection);
				}
				else {
					console.log(`${userName} is already in the waiting room`);
				}

				console.log('Users in waiting room:', [...app.waitingRoomConns.keys()]);

				socket.send(JSON.stringify({
					type: 'joinedRoom',
					message: `You have joined waiting room`
				}));

				if (app.waitingRoomConns.size >= 2) {
					const game = new Game();
					app.gameInstances.set(game.gameRoomId, game);
					redirectToGameRoom(game.gameRoomId, app);
					app.gameInstances.get(game.gameRoomId).startLoop();
					console.log('Game started:', game.gameRoomId);
				}
			}
		}

		socket.onclose = () => {
			if (userName && app.waitingRoomConns.has(userName)) {
				app.waitingRoomConns.delete(userName);
			}
		}

		socket.onerror = (err) => {
			console.error('WebSocket error:', err);
		}
	});
}

function redirectToGameRoom(gameRoomId: string, app: FastifyInstance) {
	console.log('Two users are in the waiting room, redirecting to game room...');

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
	
	console.log(`Redirecting ${users[0][0]} and ${users[1][0]} to game room: ${gameRoomId}`);
}