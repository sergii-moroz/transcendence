import {
	FastifyInstance,
	FastifyPluginOptions,
} from "fastify"

import { acceptGameInviteSchema, chatInitSchema, gameInviteSchema } from "../../schemas/chat.schema.js";
import { handleAcceptGameInvite, handleChatInit, handleDenyGameInvite, handleGameInviteCreation, handleSocialSocket } from "../../controllers/chat.controllers.js";

export const chat = async (app: FastifyInstance, opts: FastifyPluginOptions) => {	
	app.post('/api/chatInit', {
			schema: chatInitSchema,
			handler: handleChatInit
		});

	app.get('/ws/chat', { websocket: true }, handleSocialSocket);

	app.post('/api/createGameInvite', {
		schema: acceptGameInviteSchema,
		handler: handleGameInviteCreation
	});

	app.post('/api/acceptGameInvite', {
		schema: acceptGameInviteSchema,
		handler: handleAcceptGameInvite
	});

	app.post('/api/denyGameInvite', {
		schema: gameInviteSchema,
		handler: handleDenyGameInvite
	});
}