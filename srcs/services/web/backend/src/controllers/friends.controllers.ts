import {
	FastifyReply,
	FastifyRequest
} from "fastify";

import {
	acceptFriend,
	addFriend,
	blockFriend,
	deleteFriend,
	getFriendList,
	getFriendRequests,
	undblockFriend
} from "../services/friends.services.js";

// template :)
// export const handleFriendListSidebar = async (
// 	req:		FastifyRequest,
// 	reply:	FastifyReply
// ) => {
// 	try {
		
// 	} catch (error) {
		// throw error;
// 	}
// }

export const handleFriendListSidebar = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	try {
		// req.server.onlineUsers
		const answer = {
			friends: await getFriendList(req),
			friendRequests: await getFriendRequests(req.user.id),
			success: true
		};
		// console.log(`Sidebar-FriendList response: `, answer);
		reply.send(answer);
	} catch (error) {
		throw error;
	}
}

export const handleFriendAdding = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	try {
		const friendName = (req.body as { name: string }).name.toLowerCase();
		await addFriend(friendName, req.user.id);
		reply.status(200).send({ success: true });
	} catch (error) {
		throw error;
	}
}

export const handleFriendAccepting = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	try {
		const friendName = (req.body as { name: string }).name;
		await acceptFriend(friendName, req.user.id);
		reply.status(200).send({ success: true });
	} catch (error) {
		throw error;
	}
}

export const handleFriendRemove = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	try {
		const friendName = (req.body as { name: string }).name;
		await deleteFriend(friendName, req.user.id);
		reply.status(200).send({ success: true });
	} catch (error) {
		throw error;
	}
}

export const handleFriendBlock = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	try {
		const friendName = (req.body as { name: string }).name;
		await blockFriend(friendName, req.user.id);
		reply.status(200).send({ success: true });
	} catch (error) {
		throw error;
	}
}

export const handleFriendUnblock = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	try {
		const friendName = (req.body as { name: string }).name;
		await undblockFriend(friendName, req.user.id);
		reply.status(200).send({ success: true });
	} catch (error) {
		throw error;
	}
}