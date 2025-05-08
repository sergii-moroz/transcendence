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

		socket.on('message', (messageBuffer: Buffer) => {
			const message = JSON.parse(messageBuffer.toString());
				if(message.type === 'input') {
					game.registerPlayerInput(message.input, socket);
				}
		})

		socket.on('close', () => {
			game.removePlayer(socket);
			if (game.players.length != 2) {
				app.gameInstances.delete(gameRoomId);
				socket.send(JSON.stringify({
					type: 'Error',
					message: `The other player has left the game.`
				}));
			}
		})

		socket.on('error', (err: Event) => {
			console.custom('ERROR', 'WebSocket error:', err);
		})
	});
}