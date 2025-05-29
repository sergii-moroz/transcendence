import {
	FastifyInstance,
	FastifyPluginOptions,
} from "fastify"
import { 
	SidebarResponse,
 	ChatInitResponse
} from "../../types/user.js"
import { db } from "../../db/connections.js";

import { getFriendRequests, getFriendList, addFriendtoDB, removeFriend } from "../../db/queries/friends.js";
import { findUserIdByUsername } from "../../services/userService.js";

export const friends = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
	app.get('/sidebar', async (req, reply) => {
		const answer: SidebarResponse = {
			friends: await getFriendList(req.user.id),
			FriendRequests: await getFriendRequests(req.user.id)
		};


		const reqests = await getFriendList(req.user.id);
		console.log(`request: `, reqests);
		reply.send(answer);
	});

	app.post('/addFriend', async (req, reply) => {
		try {
			const friendName = (req.body as { name: string }).name;
			await addFriendtoDB(friendName, req.user.id);
			reply.status(200).send;
		} catch (error) {
			console.custom("ERROR", error);
			reply.status(400).send();
		}
	});

	app.post('/acceptFriend', async (req, reply) => {
		try {
			const friendName = (req.body as { name: string }).name;
			const inviter_id = await findUserIdByUsername(friendName);
			await new Promise<void>((resolve, reject) => {
				db.run(
					'UPDATE friends SET status = "accepted" WHERE inviter_id = ? AND recipient_id = ?',
					[inviter_id, req.user.id],
					function (err) {
						if (err) reject(err);
						else resolve();
					}
				);
			});
			reply.status(200).send;
		} catch (error) {
			console.custom("ERROR", error);
			reply.status(400).send();
		}
	});

	app.post('/rejectFriend', async (req, reply) => {
		try {
			const friendName = (req.body as { name: string }).name;
			const inviter_id = await findUserIdByUsername(friendName);
			await new Promise<void>((resolve, reject) => {
				db.run(
					'DELETE FROM friends WHERE inviter_id = ? AND recipient_id = ?',
					[inviter_id, req.user.id],
					function (err) {
						if (err) reject(err);
						else resolve();
					}
				);
			});
			reply.status(200).send;
		} catch (error) {
			console.custom("ERROR", error);
			reply.status(400).send();
		}
	});

	app.post('/deleteFriend', async (req, reply) => {
		try {
			const friendName = (req.body as { name: string }).name;
			await removeFriend(friendName, req.user.id);
			reply.status(200).send;
		} catch (error) {
			console.custom("ERROR", error);
			reply.status(400).send();
		}
	});

	app.post('/blockFriend', async (req, reply) => {
		try {
			const friendName = (req.body as { name: string }).name;
			const friend_id = await findUserIdByUsername(friendName);
			await new Promise<void>((resolve, reject) => {
				db.run(
					'UPDATE friends SET blocked_by = ? WHERE (inviter_id = ? AND recipient_id = ?) or (inviter_id = ? and recipient_id = ?)',
					[req.user.id, friend_id, req.user.id, req.user.id, friend_id],
					function (err) {
						if (err) reject(err);
						else resolve();
					}
				);
			});
			reply.status(200).send;
		} catch (error) {
			console.custom("ERROR", error);
			reply.status(400).send();
		}
	});

	app.post('/unblockFriend', async (req, reply) => {
		try {
			const friendName = (req.body as { name: string }).name;
			const friend_id = await findUserIdByUsername(friendName);
			await new Promise<void>((resolve, reject) => {
				db.run(
					'UPDATE friends SET blocked_by = ? WHERE (inviter_id = ? AND recipient_id = ?) or (inviter_id = ? and recipient_id = ?)',
					[null, friend_id, req.user.id, req.user.id, friend_id],
					function (err) {
						if (err) reject(err);
						else resolve();
					}
				);
			});
			reply.status(200).send;
		} catch (error) {
			console.custom("ERROR", error);
			reply.status(400).send();
		}
	});

	app.post('/chat', async (req, reply) => {
		const chatPartner = (req.body as { name: string }).name;
		const answer: ChatInitResponse = {
			friend: {
				name: chatPartner,
				picture: "../uploads/bernd.jpg",
				onlineState: 'online',
				blocked: false
			},
			messages: [
				{
					owner: 'you',
					text: 'hallo',
					timestamp: '12:12'
				},
				{
					owner: chatPartner,
					text: 'baumaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
					timestamp: '11:11'
				},
				{
					owner: 'you',
					text: 'train',
					timestamp: '10:10'
				}
			],
			gameInvite: true
		};
		reply.send(answer);
	});
}
