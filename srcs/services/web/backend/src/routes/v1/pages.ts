import {
	FastifyInstance,
	FastifyPluginOptions,
} from "fastify"

import {
	// HomeResponse,
	SidebarResponse,
 	ChatInitResponse
} from "../../types/user.js"

import { findUserById } from "../../services/userService.js";

export const pages = async (app: FastifyInstance, opts: FastifyPluginOptions) => {

	app.get('/profile', async (req, reply) => {
		const userInfo = await findUserById(req.user.id)
		reply.send(userInfo)
	});
}
