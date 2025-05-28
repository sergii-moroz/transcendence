import {
	FastifyInstance,
	FastifyPluginOptions,
} from "fastify"
import { 
	HomeResponse,
	SidebarResponse,
 	ChatInitResponse
} from "../../types/user.js"

import { findUserById } from "../../services/userService.js";
import { getFriendRequests, getOnlineFriends } from "../../db/queries/friends.js";

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

	app.get('/sidebar', async (req, reply) => {
		const answer: SidebarResponse = {
			friends: {
				online: await getOnlineFriends(req.user.id),
				offline: [
					{
						name: "Manfred",
						picture: "/uploads/hans.jpg",
						// unreadMessages: false
					},
					{
						name: "Horst",
						picture: "/uploads/jane.jpg",
						// unreadMessages: true
					}
				]
			},
			FriendRequests: await getFriendRequests(req.user.id)
		};


		const reqests = await getOnlineFriends(req.user.id);
		console.log(`request: `, reqests);
		reply.send(answer);
	});

	app.post('/chat', async (req, reply) => {
		const chatPartner = (req.body as { name: string }).name;

		const answer: ChatInitResponse = {
			friend: {
				name: chatPartner,
				picture: "../uploads/bernd.jpg",
				onlineState: 'online'
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