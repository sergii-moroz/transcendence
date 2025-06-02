import {
	FastifyInstance,
	FastifyPluginOptions,
} from "fastify"
import { 
 	ChatInitResponse,
	  MessageToServer
} from "../../types/user.js"

import { getFriendChat } from "../../db/queries/friends.js";
import { findUserIdByUsername } from "../../services/userService.js";
import { addMessage, getOldMessages } from "../../db/queries/chat.js";
import { WebSocket } from "@fastify/websocket";
import { sendMessage } from "../../services/utils.js";

export const chat = async (app: FastifyInstance, opts: FastifyPluginOptions) => {	
	app.post('/api/chat', async (req, reply) => {
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

	app.get('/ws/chat', {websocket: true }, async (socket, req) => {
		
		if (app.onlineUsers.has(req.user.username)) {
			socket.close(1000, 'User tried to login, eventhough he is already');
			console.custom("WARN", `User: ${req.user.username} tried to login while already logged on. Connection was forbidden`);
		}

		app.onlineUsers.set(req.user.username, socket);
    	console.custom("INFO", `${req.user.username} is now online`);

		socket.on('message', async (messageBuffer: Buffer) => {
			try {
				const message = JSON.parse(messageBuffer.toString()) as MessageToServer;

				const receiver_id = await findUserIdByUsername(message.to);
				if (!receiver_id) throw new Error("friend not found");
				addMessage(req.user.id, receiver_id, message.text);

				if (app.onlineUsers.has(message.to)) {
					sendMessage(message.text, req.user.username, app.onlineUsers.get(message.to));
				}
		} catch (error) {
			console.custom("ERROR", error);
			socket.send({type: "error", text: "Message processing on the server failed"});
		}
			
		})

		socket.on('close', () => {
			app.onlineUsers.delete(req.user.username);
			console.custom("DEBUG", `${req.user.username} is now offline`);
		})

		socket.on('error', (err: Event) => {
			app.onlineUsers.delete(req.user.username);
			console.custom("ERROR", `${req.user.username} is now offline`);
		})
	});

}