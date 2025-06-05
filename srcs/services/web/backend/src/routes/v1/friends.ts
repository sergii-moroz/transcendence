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

export const friends = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
	app.get('/sidebar', {
		schema: friendListSbSchema,
		handler: handleFriendListSidebar
	});

	app.post('/addFriend', {
		schema: friendSchema,
		handler: handleFriendAdding
	});

	app.post('/acceptFriend', {
		schema: friendSchema,
		handler: handleFriendAccepting
	});

	app.post('/rejectFriend', {
		schema: friendSchema,
		handler: handleFriendRemove
	});

	app.post('/deleteFriend', {
		schema: friendSchema,
		handler: handleFriendRemove
	});

	app.post('/blockFriend', {
		schema: friendSchema,
		handler: handleFriendBlock
	});

	app.post('/unblockFriend', {
		schema: friendSchema,
		handler: handleFriendUnblock
	});
}

