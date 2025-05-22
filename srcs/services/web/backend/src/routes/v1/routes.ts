import {
	FastifyInstance,
	FastifyPluginOptions,
} from "fastify"

export const routes = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
	app.get('/game/:gameRoomId', (req, reply) => {
		return reply.type('text/html').sendFile('../public/index.html');
	});
	app.get('/tournament/:tournamentId', (req, reply) => {
		return reply.type('text/html').sendFile('../public/index.html');
	});
}
