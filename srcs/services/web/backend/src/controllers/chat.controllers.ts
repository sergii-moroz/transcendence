import {
	FastifyReply,
	FastifyRequest
} from "fastify";
import {
	addMessage,
	getFriendChat,
	getOldMessages,
	isBlocked
} from "../services/chat.services.js";

import { WebSocket } from "@fastify/websocket";
import { MessageToServer } from "../types/user.js";
import { findUserIdByUsername } from "../services/userService.js";
import { sendMessage } from "../services/utils.js";
import { FriendInvalid } from "../errors/friends.error.js";

export const handleChatInit = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	try {
		const friendName = (req.body as { name: string }).name;
		const friend = await getFriendChat(friendName, req);
		const answer = {
			friend,
			messages: await getOldMessages(friendName, req.user.id, friend.blocked),
			gameInvite: true, //TODO
			success: true
		};
		// console.log(`Chat Init response: `, answer);
		reply.status(200).send(answer);
	} catch (error) {
		throw error;
	}
}

export const handleSocialSocket = async (
	socket:	WebSocket,
	req:		FastifyRequest
) => {
	try {
		if (req.server.onlineUsers.has(req.user.username)) {
			socket.close(1000, "User already logged in");
			console.custom("WARN", `Duplicate login attempt: ${req.user.username}`);
			return ;
		}

		req.server.onlineUsers.set(req.user.username, socket);
		console.custom("INFO", `${req.user.username} is now online`);

		socket.on('message', async (messageBuffer: Buffer) => {
			try {
				const message = JSON.parse(messageBuffer.toString()) as MessageToServer;
	
				const receiver_id = await findUserIdByUsername(message.to);
				if (!receiver_id)
					throw new FriendInvalid(message.to);
	
				await addMessage(req.user.id, receiver_id, message.text);
	
				const isUserblocked = await isBlocked(req.user.id, message.to);
				if (!isUserblocked && req.server.onlineUsers.has(message.to)) {
					sendMessage(message.text, req.user.username, req.server.onlineUsers.get(message.to));
				}		
			} catch (error) {
				let errorMSG = 'Server failed on responding to message';
				if (error instanceof Error && 'statusCode' in error) errorMSG = 'server cant process message because: ' + error.message;
				req.server.log.error(errorMSG);
				socket.send(JSON.stringify({ type: 'error', text: errorMSG }));
			}
		})

		socket.on('close', () => {
			req.server.onlineUsers.delete(req.user.username);
			console.custom("INFO", `${req.user.username} is now offline`);
		})

		socket.on('error', (err: Event) => {
			req.server.onlineUsers.delete(req.user.username);
			console.custom("ERROR", `${req.user.username} is now offline`);
		})
	} catch (error) {
		socket.close(1011, 'Unexpected error');
    	console.custom("ERROR", `Fatal error on socket: ${error}`);
	}
}