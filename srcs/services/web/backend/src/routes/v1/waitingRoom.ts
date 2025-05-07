import {
	FastifyInstance,
	FastifyPluginOptions,
} from "fastify"

import { Game } from "../../services/game.js";

export const waitingRoomSock = async (app: FastifyInstance) => {
    
    app.get('/waiting-room', {websocket: true }, async (connection: WebSocket, req: FastifyRequest) => {
		await app.authenticate(req);
		let userName = req.user.username;
		const socket = connection;

		socket.onmessage = (messageBuffer) => {
			const message = JSON.parse(messageBuffer.toString());

			if(message.type === 'joinRoom') {
				userName = message.username;

				console.log(`${userName} has joined the waiting room`);
				
				if(!app.waitingRoomConns.includes(userName)) {
					app.waitingRoomConns.push([userName, connection]);
				}
				else {
					console.log(`${userName} is already in the waiting room`);
				}

				// console.log('Users in waiting room:', app.waitingRoomConns.map(([userName]) => userName));

				socket.send(JSON.stringify({
					type: 'joinedRoom',
					message: `You have joined waiting room`
				}));

				if (app.waitingRoomConns.length >= 2) { // still need to implement the game rooms
					const game = new Game();
					app.gameInstances.set(game.gameRoomId, game);
					redirectToGameRoom(game.gameRoomId, app);
					console.log('Game started:', game.gameRoomId);
				}
			}
		}

		socket.onclose = () => {
			if (userName && app.waitingRoomConns.includes(userName)) {
				const index = app.waitingRoomConns.findIndex(([name, socket]: [string, WebSocket]) => name === userName);
				if (index !== -1) {
					app.waitingRoomConns.splice(index, 1);
				}
			}
		}

		socket.onerror = (err) => {
			console.error('WebSocket error:', err);
		}
	});
}

function redirectToGameRoom(gameRoomId: string, app: FastifyInstance) {
	console.log('Two users are in the waiting room, redirecting to game room...');
	const user1 = app.waitingRoomConns.shift();
	const user2 = app.waitingRoomConns.shift();

	user1[1].send(JSON.stringify({
		type: 'redirectingToGame',
		gameRoomId: gameRoomId,
		message: `Redirecting to game room: ${gameRoomId}`
	}));
	user2[1].send(JSON.stringify({
		type: 'redirectingToGame',
		gameRoomId: gameRoomId,
		message: `Redirecting to game room: ${gameRoomId}`
	}));

	console.log(`Redirecting ${user1[0]} and ${user2[0]} to game room: ${gameRoomId}`);
	app.gameInstances.get(gameRoomId).startLoop();
	console.log('Game started:', gameRoomId);
}