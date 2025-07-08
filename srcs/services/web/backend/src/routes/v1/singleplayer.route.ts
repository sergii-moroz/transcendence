import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from "fastify";
import { authenticate } from "../../services/authService.js";
import { Game } from "../../services/game.js";
import { GAME_MODES } from "../../public/types/game-history.types.js";

export const singlePlayerRoutes = async (
	app:	FastifyInstance,
	opts:	FastifyPluginOptions
) => {
	app.get('/room-id', {
		preHandler: [authenticate],
		handler: async (req, reply) => {
			const userId = req.user.id;

			const alreadyInGame_gameID = findSingleplayerGameByPlayerId(userId, req);
			if (alreadyInGame_gameID) {
				console.custom('INFO', `Users is already in a Singleplayer game. Redirecting to game room: ${alreadyInGame_gameID}`);
				return reply.status(200).send({ roomId: alreadyInGame_gameID });
			}
			const game = new Game(null, GAME_MODES.Singleplayer);
			app.gameInstances.set(game.gameRoomId, game);

			return reply.status(200).send({ roomId: game.gameRoomId });
		}
	});
}

function findSingleplayerGameByPlayerId(targetId: number, req: FastifyRequest): string | null {
	for (const [gameID, game] of req.server.gameInstances.entries()) {
		for (const player of game.players.values()) {
			if (game.game_mode === GAME_MODES.Singleplayer && player.id === targetId.toString()) {
				return gameID ;
			}
		}
	}
	return null;
}
