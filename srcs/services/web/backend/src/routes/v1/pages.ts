import {
	FastifyInstance,
	FastifyPluginOptions,
} from "fastify"

import {
	SidebarResponse,
 	ChatInitResponse
} from "../../types/user.js"

import { findUserById } from "../../services/userService.js";

export const pages = async (app: FastifyInstance, opts: FastifyPluginOptions) => {

	app.get('/profile', async (req, reply) => {
		const userInfo = await findUserById(req.user.id)
		reply.send(userInfo)
	});

	app.get('/sidebar', async (req, reply) => {
		const answer: SidebarResponse = {
			friends: {
				online: [
					{
						name: "Hartmut",
						picture: "../uploads/hans.jpg",
						unreadMessages: true
					},
					{
						name: "Peter",
						picture: "john.jpg",
						unreadMessages: false
					},
					{
						name: "Klaus",
						picture: "john.jpg",
						unreadMessages: true

					}
				],
				offline: [
					{
						name: "Manfred",
						picture: "../uploads/hans.jpg",
						unreadMessages: false
					},
					{
						name: "Horst",
						picture: "jane.jpg",
						unreadMessages: true
					}
				]
			},
			FriendRequests: [
				{
					name: "Bernd",
					picture: "../uploads/bernd.jpg"
				},
				{
					name: "Bernhard",
					picture: 'aa'
				}
			]
		};
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
