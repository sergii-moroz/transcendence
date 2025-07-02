import {
	FastifyInstance,
	FastifyPluginOptions,
} from "fastify"

import { acceptGameInviteSchema, chatInitSchema, gameInviteSchema } from "../../schemas/chat.schema.js";
import { handleAcceptGameInvite, handleChatInit, handleDenyGameInvite, handleGameInviteCreation, handleSocialSocket } from "../../controllers/chat.controllers.js";
import { authenticate, checkCsrf } from "../../services/authService.js";

export const chat = async (app: FastifyInstance, opts: FastifyPluginOptions) => {	
	app.post('/api/chatInit', {
			schema: chatInitSchema,
			preHandler:	[authenticate],
			handler: handleChatInit
		});

	app.get('/ws/chat', { websocket: true, preHandler: [authenticate]}, handleSocialSocket);

	app.post('/api/createGameInvite', {
		schema: acceptGameInviteSchema,
		preHandler:	[authenticate, checkCsrf],
		handler: handleGameInviteCreation
	});

	app.post('/api/acceptGameInvite', {
		schema: acceptGameInviteSchema,
		preHandler:	[authenticate, checkCsrf],
		handler: handleAcceptGameInvite
	});

	app.post('/api/denyGameInvite', {
		schema: gameInviteSchema,
		preHandler:	[authenticate, checkCsrf],
		handler: handleDenyGameInvite
	});
}