import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { loginSchema, logoutSchema, registerSchema } from "../../schemas/auth.js";
import { authenticate, checkCsrf } from "../../services/authService.js";
import { handleLogin, handleLogout, handleRefresh, handleRegister } from "../../controllers/auth.controllers.js";
import { handlePasswordReset } from "../../controllers/api.controller.js";

export const authRoutes = async (app: FastifyInstance, opts: FastifyPluginOptions) => {

	app.post('/register', {
		schema:			registerSchema,
		handler:		handleRegister
	})

	app.post('/login', {
		schema:			loginSchema,
		handler:		handleLogin
	})

	app.post('/logout', {
		schema:			logoutSchema,
		preHandler:	[authenticate, checkCsrf],
		handler:		handleLogout
	})

	app.get('/user', {
		preHandler:	[authenticate]
	},
	(req, reply) => {
		reply.send(req.user);
	});

	app.post('/refresh', {
		handler:	handleRefresh
	})

	app.post('/password/reset', {
		preHandler: [authenticate, checkCsrf],
		handler: handlePasswordReset
	})

	app.get('/ping', {
		preHandler: [authenticate]
	}, (req, reply) => {
		reply.send({ success: true })
	})

}
