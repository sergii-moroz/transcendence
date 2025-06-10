import {
	FastifyInstance,
	FastifyPluginOptions,
} from "fastify"

import { chatInitSchema } from "../../schemas/chat.schema.js";
import { handleChatInit, handleSocialSocket } from "../../controllers/chat.controllers.js";

export const chat = async (app: FastifyInstance, opts: FastifyPluginOptions) => {	
	app.post('/api/chatInit', {
			schema: chatInitSchema,
			handler: handleChatInit
		});

	app.get('/ws/chat', { websocket: true }, handleSocialSocket);
}