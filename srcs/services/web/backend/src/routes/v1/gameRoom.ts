import {
	FastifyInstance,
	FastifyPluginOptions,
} from "fastify"

export const gameRoomSock = async (app: FastifyInstance) => {

    app.get('/game/:gameRoomId', { websocket: true }, (connection: WebSocket, req: FastifyRequest<{ Params: { gameRoomId: string } }>) => {
		const gameRoomId = req.params.gameRoomId;
		console.log(`User connected to game room: ${gameRoomId}`);
		const game = app.gameInstances.get(gameRoomId);

		if (!game) {
			connection.close();
			return;
		}
		game.addPlayer(connection);

		connection.onmessage = (messageBuffer: Event) => {
			const message = JSON.parse(messageBuffer.toString());
				if(message.type === 'input') {
					game.registerPlayerInput(message.input, connection);
				}
		}

		connection.onclose = () => {
			game.removePlayer(connection);
			if (game.players.length != 2) {
				app.gameInstances.delete(gameRoomId);
				connection.send(JSON.stringify({
					type: 'Error',
					message: `The other player has left the game.`
				}));
			}
		}

		connection.onerror = (err: Event) => {
			console.error('WebSocket error:', err);
		}
	});
}