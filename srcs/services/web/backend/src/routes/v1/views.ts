import {
	FastifyInstance,
	FastifyPluginOptions,
} from "fastify"
import { 
	HomeResponse,
	SidebarResponse,
} from "../../types/user.js";
import { findUserById } from "../../services/userService.js";

export const views = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
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
			friendAmount: 2
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
				online: [
					{
						name: "Hartmut",
						picture: "../uploads/hans.jpg"
					},
					{
						name: "Peter",
						picture: "john.jpg"
					},
					{
						name: "Klaus",
						picture: "john.jpg"
					},
					{
						name: "Klaus",
						picture: "john.jpg"
					},
					{
						name: "Klaus",
						picture: "john.jpg"
					},
					{
						name: "Klaus",
						picture: "john.jpg"
					},
					{
						name: "Klaus",
						picture: "john.jpg"
					},
					{
						name: "Klaus",
						picture: "john.jpg"
					},
					{
						name: "Klaus",
						picture: "john.jpg"
					},
					{
						name: "Klaus",
						picture: "john.jpg"
					},
					{
						name: "Klaus",
						picture: "john.jpg"
					},
					{
						name: "Klaus",
						picture: "john.jpg"
					}
				],
				offline: [
					{
						name: "Manfred",
						picture: "../uploads/hans.jpg"
					},
					{
						name: "Horst",
						picture: "jane.jpg"
					}
				]
			},
			FriendRequests: [
				{
					name: "Bernd",
					picture: "../uploads/bernd.jpg"
				},
				{
					name: "Ben",
					picture: 'aa'
				}
			]
		};
		return reply.send(answer);
	});
}