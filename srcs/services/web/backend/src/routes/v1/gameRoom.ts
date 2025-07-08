import {
	FastifyInstance,
	FastifyPluginOptions,
	FastifyRequest
} from "fastify"
import { GameRoomRequest } from "../../types/game.js";
import { authenticate } from "../../services/authService.js";


export const gameRoomSock = async (app: FastifyInstance) => {

	app.get('/game/:gameRoomId', { websocket: true, preHandler: [authenticate]}, (socket, req: FastifyRequest) => {
		console.custom("INFO", `New WebSocket connection from ${req.user.id}`);
		const { gameRoomId } = req.params as { gameRoomId: string };

		const game = app.gameInstances.get(gameRoomId);
		const userId = req.user.id.toString();
		const userName = req.user.username;

		if (!game) {
			console.custom("WARN", 'User: ' + req.user.username + ' tried to connect to a non-existing game room: ' + gameRoomId);
			socket.close();
			return;
		}

		game.addPlayer(socket, userId, userName);
		console.custom('INFO', `User: ${req.user.username} connected to game room: ${gameRoomId}`);

		socket.on('message', (messageBuffer: Event) => {
			const message = JSON.parse(messageBuffer.toString());
				if(message.type === 'input') {
					game.registerPlayerInput(message.input, socket);
				}
				if(message.type === 'deleteGameBeforeStart') {
					if (app.gameInstances.get(gameRoomId)?.gameStartTime === 0) { //game hasnt started
						app.gameInstances.delete(gameRoomId);
						console.custom('INFO', `Game room ${gameRoomId} closed.`);
					}
				}
		});


		socket.on('close', () => {
			console.custom('INFO', `User: ${req.user.username} disconnected from game room: ${gameRoomId}`);

			if (app.gameInstances.has(gameRoomId) // if Player disconnected after game ended => delete game. Otherwise option to reconnect
				&& app.gameInstances.get(gameRoomId)?.gameStartTime !== 0
				&& !app.gameInstances.get(gameRoomId)?.gameRunning ) { 
				app.gameInstances.delete(gameRoomId);
				console.custom('INFO', `Game room ${gameRoomId} closed gracefully`);
			}
		})

		socket.on('error', (err: Event) => {
			console.custom('ERROR', 'WebSocket error:', err);
		})
	});
}
