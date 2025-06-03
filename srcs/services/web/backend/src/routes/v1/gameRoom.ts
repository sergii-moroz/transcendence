import {
	FastifyInstance,
	FastifyPluginOptions,
	FastifyRequest
} from "fastify"
import { GameRoomRequest } from "../../types/game.js";


export const gameRoomSock = async (app: FastifyInstance) => {

	const disconnectTimeouts = new Map<string, NodeJS.Timeout>();
	
	app.get('/game/:gameRoomId', { websocket: true }, (socket, req: GameRoomRequest) => {
		console.custom("INFO", `New WebSocket connection from ${req.user.id}`);
		const gameRoomId = req.params.gameRoomId;
		const game = app.gameInstances.get(gameRoomId);
		const userId = req.user.id.toString();
		const userName = req.user.username;

		if (!game) {
			console.custom("WARN", 'User: ' + req.user.username + ' tried to connect to a non-existing game room: ' + gameRoomId);
			socket.close();
			return;
		}

		if (disconnectTimeouts.has(userId)) {
			clearTimeout(disconnectTimeouts.get(userId)!);
			disconnectTimeouts.delete(userId);
		}
		game.addPlayer(socket, userId, userName);
		console.custom('INFO', `User: ${req.user.username} connected to game room: ${gameRoomId}`);

		socket.on('message', (messageBuffer: Event) => {
			const message = JSON.parse(messageBuffer.toString());
				if(message.type === 'input') {
					game.registerPlayerInput(message.input, socket);
				}
				if(message.type === 'exit') {
					if(disconnectTimeouts.has(userId)) {
						clearTimeout(disconnectTimeouts.get(userId)!);
						disconnectTimeouts.delete(userId);
					}
					game.removePlayer(socket);
					if (app.gameInstances.has(gameRoomId)) {
						app.gameInstances.delete(gameRoomId);
						console.custom('INFO', `Game room ${gameRoomId} closed.`);
					}
				}
		});


		socket.on('close', () => {
			console.custom('INFO', `User: ${req.user.username} disconnected from game room: ${gameRoomId}`);

			const timeout = setTimeout(() => {
				if (app.gameInstances.has(gameRoomId)) {
					game.removePlayer(socket);
					console.custom('INFO', `Game room ${gameRoomId} closed due to inactivity`);
				}
				disconnectTimeouts.delete(userId);
			}, 10000);

			disconnectTimeouts.set(userId, timeout);
		})

		socket.on('error', (err: Event) => {
			console.custom('ERROR', 'WebSocket error:', err);
		})
	});
}
