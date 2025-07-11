import {
	FastifyRequest,
} from "fastify"

import { Friend } from "../types/user.js";
import { db } from "../db/connections.js";
import { findUserIdByUsername } from "./userService.js";
import {
	FriendInvalid,
	FriendInvalidCustom,
	FriendshipInvalid
} from "../errors/friends.error.js";


const DEFAULT_PICTURE_PATH = "/uploads/default.jpg";

export const getFriendRequests = async (id: number): Promise<Friend[]> => {
	return new Promise((resolve, reject) => {
		db.all<Friend>(' \
			SELECT username as name, avatar as picture from friends f \
			JOIN users u on f.inviter_id = u.id \
			WHERE recipient_id = ? and status = "pending" \
			ORDER by created_at',
			[id],
			(err, rows) => {
				if (err) return reject(err);
				rows.forEach(friend => {
					if (!friend.picture) friend.picture = DEFAULT_PICTURE_PATH;
				})
				resolve(rows);
			})
	})
}

export const getFriendNames = async (id: number): Promise<string[]> => {
	return new Promise<string[]>((resolve, reject) => {
		db.all<{username: string}>(' \
			SELECT u.username from friends f \
			JOIN users u on u.id = \
				case \
					when f.inviter_id = ? then f.recipient_id \
					else f.inviter_id \
				end \
			WHERE (inviter_id = ? and status = "accepted") or (recipient_id = ? and status = "accepted") \
			ORDER by created_at',
			[id, id, id],
			(err, rows) => {
				if (err) return reject(err);
				resolve(rows.map(row => row.username));
		})
	})
}

export const getFriendList = async (req: FastifyRequest): Promise<{online: Friend[], offline: Friend[]}> => {
	const id = req.user.id;
	const allFriends = await new Promise<Friend[]>((resolve, reject) => {
		db.all<Friend>(' \
			SELECT username as name, avatar as picture from friends f \
			JOIN users u on u.id = \
				case \
					when f.inviter_id = ? then f.recipient_id \
					else f.inviter_id \
				end \
			WHERE (inviter_id = ? and status = "accepted") or (recipient_id = ? and status = "accepted") \
			ORDER by created_at',
			[id, id, id],
			(err, rows) => {
				if (err) return reject(err);
				resolve(rows);
		})
	})
	allFriends.forEach(friend => {
		if (!friend.picture) friend.picture = DEFAULT_PICTURE_PATH;
	})

	return {
		online: allFriends.filter(friend => req.server.onlineUsers.has(friend.name)),
		offline: allFriends.filter(friend => !req.server.onlineUsers.has(friend.name))
	};
}

export const addFriend = async (friendName: string, inviter_id: number): Promise<void> => {
	const recipient_id = await findUserIdByUsername(friendName);
	if (!recipient_id || recipient_id == inviter_id) throw new FriendInvalid(friendName);
	return new Promise((resolve, reject) => {
		db.run(' \
			INSERT INTO friends (inviter_id, recipient_id, status) VALUES (?, ?, "pending")',
			[inviter_id, recipient_id],
			(err) => {
				if (err) {
					console.log(err);
					if (err.message.includes('Friendship already exists') || err.message.includes('UNIQUE constraint failed')) {
						reject(new FriendInvalidCustom(`friendship already exists with ${friendName} (or is pending)`));
					}
					return reject(err);
				} 
				resolve();
			}
		)
	})
}

export const acceptFriend = async (friendName: string, recipient_id: number): Promise<void> => {
	const inviter_id = await findUserIdByUsername(friendName);
	if (!inviter_id) throw new FriendInvalid(friendName);
	await new Promise<void>((resolve, reject) => {
		db.run(
			'UPDATE friends SET status = "accepted" WHERE inviter_id = ? AND recipient_id = ?',
			[inviter_id, recipient_id],
			function (err) {
				if (err) reject(err);
				else if (this.changes === 0) reject(new FriendshipInvalid())
				else resolve();
			}
		);
	});
}

export const deleteFriend = async (friendName: string, user_id: number): Promise<void> => {
	const friend_id = await findUserIdByUsername(friendName);
	if (!friend_id) throw new FriendInvalid(friendName);
	await new Promise<void>((resolve, reject) => {
		db.run(
			'DELETE FROM friends WHERE (inviter_id = ? AND recipient_id = ?) or (recipient_id = ? AND inviter_id = ?)',
			[friend_id, user_id, friend_id, user_id],
			function (err) {
				if (err) reject(err);
				else if (this.changes === 0) reject(new FriendshipInvalid())
				else resolve();
			}
		);
	});
}

export const blockFriend = async (friendName: string, user_id: number): Promise<void> => {
	const friend_id = await findUserIdByUsername(friendName);
	if (!friend_id) throw new FriendInvalid(friendName);
	await new Promise<void>((resolve, reject) => {
		db.run(
			'UPDATE friends \
				SET \
					blocked_by_inviter = CASE WHEN inviter_id = ? THEN CURRENT_TIMESTAMP ELSE blocked_by_inviter END, \
					blocked_by_recipient = CASE WHEN recipient_id = ? THEN CURRENT_TIMESTAMP ELSE blocked_by_recipient END \
				WHERE (inviter_id = ? AND recipient_id = ?) or (inviter_id = ? and recipient_id = ?)',
			[user_id, user_id, friend_id, user_id, user_id, friend_id],
			function (err) {
				if (err) reject(err);
				else if (this.changes === 0) reject(new FriendshipInvalid())
				else resolve();
			}
		);
	});
}

export const undblockFriend = async (friendName: string, user_id: number): Promise<void> => {
	const friend_id = await findUserIdByUsername(friendName);
	if (!friend_id) throw new FriendInvalid(friendName);
	await new Promise<void>((resolve, reject) => {
		db.run(
			'UPDATE friends \
				SET \
					blocked_by_inviter = CASE WHEN inviter_id = ? THEN null ELSE blocked_by_inviter END, \
					blocked_by_recipient = CASE WHEN recipient_id = ? THEN null ELSE blocked_by_recipient END \
				WHERE (inviter_id = ? AND recipient_id = ?) or (inviter_id = ? and recipient_id = ?)',
			[user_id, user_id, friend_id, user_id, user_id, friend_id],
			function (err) {
				if (err) reject(err);
				else if (this.changes === 0) reject(new FriendshipInvalid())
				else resolve();
			}
		);
	});
}
