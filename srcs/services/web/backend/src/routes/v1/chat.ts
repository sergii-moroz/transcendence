import {
	FastifyInstance,
	FastifyPluginOptions,
} from "fastify"
import { 
 	ChatInitResponse
} from "../../types/user.js"

import { getFriendChat } from "../../db/queries/friends.js";
import { findUserIdByUsername } from "../../services/userService.js";
import { getOldMessages } from "../../db/queries/chat.js";

export const chat = async (app: FastifyInstance, opts: FastifyPluginOptions) => {	
	app.post('/chat', async (req, reply) => {
		try {
			const chatPartner = (req.body as { name: string }).name;
			const friend = await getFriendChat(chatPartner, req.user.id);
			const answer: ChatInitResponse = {
				friend,
				messages: await getOldMessages(chatPartner, req.user.id, friend.blocked),
				gameInvite: true
			};
			console.log(await getOldMessages(chatPartner, req.user.id, friend.blocked));
			reply.send(answer);
		} catch (error) {
			console.custom("ERROR", error);
			reply.status(400).send();
		}
	});
}