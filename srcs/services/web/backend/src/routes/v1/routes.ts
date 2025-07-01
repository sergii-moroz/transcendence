import {
	FastifyInstance,
	FastifyPluginOptions,
} from "fastify"
import { authenticate } from "../../services/authService.js";

export const routes = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
	app.get('/game/:gameRoomId', {preHandler: [authenticate]}, (req, reply) => {
		return reply.type('text/html').sendFile('../public/index.html');
	});
}
