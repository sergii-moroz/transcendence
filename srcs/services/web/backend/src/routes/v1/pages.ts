import {
	FastifyInstance,
	FastifyPluginOptions,
} from "fastify"
import { 
	HomeResponse,
} from "../../types/user.js"

import { findUserById } from "../../services/userService.js";

export const pages = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
	app.get('/home', async (request, reply) => {
		const answer: HomeResponse = {
			stats: {
				matches: 42,
				wins: 42,
				percentage: 42
			},
			topPlayer: {
				name: 'ProGamer',
				matches: 42,
				wins: 42,
				percentage: 42
			},
		};
		return reply.send(answer);
	});

	app.get('/profile', async (req, reply) => {
		const userInfo = await findUserById(req.user.id)
		reply.send(userInfo)
	});
}