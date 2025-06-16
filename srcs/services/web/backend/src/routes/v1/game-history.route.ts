import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { authenticate } from "../../services/authService.js";
import { handleGetHistoryPingPong } from "../../controllers/history.controller.js";

export const historyRoutes = async (
	app:	FastifyInstance,
	opts:	FastifyPluginOptions
) => {
	app.get('/ping-pong', {
			preHandler: [authenticate],
			handler: handleGetHistoryPingPong
	})
}
