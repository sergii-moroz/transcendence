import {
	FastifyInstance,
	FastifyPluginOptions,
} from "fastify"

import { 
	friendSchema,
	friendListSbSchema
} from "../../schemas/friends.schemas.js";

import {
	handleFriendAccepting,
	handleFriendAdding,
	handleFriendBlock,
	handleFriendListSidebar,
	handleFriendRemove,
	handleFriendUnblock
} from "../../controllers/friends.controllers.js";
import { authenticate, checkCsrf } from "../../services/authService.js";

export const friends = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
	app.get('/friendList', {
		schema: friendListSbSchema,
		preHandler:	[authenticate],
		handler: handleFriendListSidebar
	});

	app.post('/addFriend', {
		schema: friendSchema,
		preHandler:	[authenticate, checkCsrf],
		handler: handleFriendAdding
	});

	app.post('/acceptFriend', {
		schema: friendSchema,
		preHandler:	[authenticate, checkCsrf],
		handler: handleFriendAccepting
	});

	app.post('/rejectFriend', {
		schema: friendSchema,
		preHandler:	[authenticate, checkCsrf],
		handler: handleFriendRemove
	});

	app.post('/deleteFriend', {
		schema: friendSchema,
		preHandler:	[authenticate, checkCsrf],
		handler: handleFriendRemove
	});

	app.post('/blockFriend', {
		schema: friendSchema,
		preHandler:	[authenticate, checkCsrf],
		handler: handleFriendBlock
	});

	app.post('/unblockFriend', {
		schema: friendSchema,
		preHandler:	[authenticate, checkCsrf],
		handler: handleFriendUnblock
	});
}

