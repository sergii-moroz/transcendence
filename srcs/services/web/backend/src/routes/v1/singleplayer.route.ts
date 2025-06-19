import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { authenticate } from "../../services/authService.js";
import { Game } from "../../services/aiGame.js";
import { GAME_MODES } from "../../public/types/game-history.types.js";

export const singlePlayerRoutes = async (
	app:	FastifyInstance,
	opts:	FastifyPluginOptions
) => {
	app.get('/room-id', {
		preHandler: [authenticate],
		handler: async (req, reply) => {
			const userId = req.user.id;
			const game = new Game(null, GAME_MODES.Singleplayer);
			app.gameInstances.set(game.gameRoomId, game);

			return reply.status(200).send({ roomId: game.gameRoomId });
		}
	});
}

