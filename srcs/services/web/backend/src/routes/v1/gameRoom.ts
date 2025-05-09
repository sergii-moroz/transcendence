import {
	FastifyInstance,
	FastifyPluginOptions,
	FastifyRequest
} from "fastify"
import { GameRoomRequest } from "../../types/game.js";

export const gameRoomSock = async (app: FastifyInstance) => {

    app.get('/game/:gameRoomId', { websocket: true }, (socket, req: GameRoomRequest) => {
		const gameRoomId = req.params.gameRoomId;
		console.custom('INFO', `User connected to game room: ${gameRoomId}`);
		const game = app.gameInstances.get(gameRoomId);

		if (!game) {
			socket.close();
			return;
		}
		game.addPlayer(socket);

		socket.on('message', (messageBuffer: Event) => {
			const message = JSON.parse(messageBuffer.toString());
				if(message.type === 'input') {
					game.registerPlayerInput(message.input, socket);
				}
		})

		socket.on('close', () => {
			game.removePlayer(socket);
			if (game.players.length !== 2) {
				if(app.gameInstances.has(gameRoomId)) {
					app.gameInstances.delete(gameRoomId);
					console.custom('INFO', `Game room ${gameRoomId} closed`);
				}
			}
		})

		socket.on('error', (err: Event) => {
			console.custom('ERROR', 'WebSocket error:', err);
		})
	});
}