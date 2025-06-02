import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { authenticate } from "../../services/authService.js";

import {
	handleGetTopPlayers,
	handleGetUserPerformance
} from "../../controllers/stats.controllers.js";

export const statsRoutes = async (
	app:	FastifyInstance,
	opts:	FastifyPluginOptions
) => {

	app.get('/user/performance', {
		preHandler: [authenticate],
		handler: handleGetUserPerformance
	})

	app.get('/top-players', {
		preHandler: [authenticate],
		handler: handleGetTopPlayers
	})
}
