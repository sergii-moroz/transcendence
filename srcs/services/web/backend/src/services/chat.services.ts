import {
	FastifyRequest,
} from "fastify"

import {
	Friend,
	FriendInChat,
	Message
} from "../types/user.js";

import { db } from "../db/connections.js";
import { findUserIdByUsername } from "./userService.js";
import {
	FriendInvalid,
	FriendInvalidCustom,
	FriendshipInvalid,
	MessageInvalid
} from "../errors/friends.error.js";


const DEFAULT_PICTURE_PATH = "/uploads/default.jpg";

export const getFriendChat = async (friendName: string, req: FastifyRequest): Promise<FriendInChat> => {
	const user_id = req.user.id;
	const friend_id = await findUserIdByUsername(friendName);
	if (!friend_id) throw new FriendInvalid(friendName);
	const FriendData = await new Promise<Friend & { blocked_by_inviter: string | null, blocked_by_recipient: string | null, inviter_id: number, recipient_id: number, game_invite_from: number | null }>((resolve, reject) => {
		db.get<Friend & { blocked_by_inviter: string | null, blocked_by_recipient: string | null, inviter_id: number, recipient_id: number, game_invite_from: number | null }>(' \
			SELECT username as name, avatar as picture, blocked_by_inviter, blocked_by_recipient, recipient_id, inviter_id, game_invite_from from friends f \
			JOIN users u on u.id = \
				case \
					when f.inviter_id = ? then f.recipient_id \
					else f.inviter_id \
				end \
			WHERE (inviter_id = ? and recipient_id = ? and status = "accepted") or (recipient_id = ? and inviter_id = ? and status = "accepted") \
			ORDER by created_at',
			[user_id, friend_id, user_id, friend_id, user_id],
			(err, row) => {
				if (err) return reject(err);
				if (!row) return reject(new FriendshipInvalid());
				resolve(row);
		})
	})

	const blockStatus = (FriendData.inviter_id == user_id ? FriendData.blocked_by_inviter : FriendData.blocked_by_recipient)
	return {
		name: FriendData.name,
		picture: FriendData.picture || DEFAULT_PICTURE_PATH,
		blocked: blockStatus,
		online: req.server.onlineUsers.has(FriendData.name),
		game_invite_from: FriendData.game_invite_from
	};
}

export const getOldMessages = async (friendName: string, user_id: number, blocked: string | null): Promise<Message[] | undefined> => {
	const friend_id = await findUserIdByUsername(friendName);
	if (!friend_id) throw new FriendInvalid(friendName);
	return new Promise((resolve, reject) => {
		let params: any[] = [friend_id, user_id, user_id, friend_id];
		let query = 'SELECT username as owner, text from messages m \
			JOIN users u on m.sender_id = u.id \
			WHERE ((sender_id = ? and receiver_id = ?) or (sender_id = ? and receiver_id = ?))';
		if (blocked) {
			query += " and created_at < ?";
			params.push(blocked);
		}
		query += ' ORDER by created_at'

		db.all<Message>(query, params, (err, rows) => {
			if (err) return reject(err);
			resolve(rows);
		})
	})
}

export const addMessage = async (sender_id: number, receiver_id: number, text: string): Promise<void> => {
	if (!text || text.length > 100) throw new MessageInvalid();
	return new Promise((resolve, reject) => {
		db.run(
			`INSERT INTO messages (sender_id, receiver_id, text) VALUES (?, ?, ?)`,
			[sender_id, receiver_id, text],
			function (err) {
				if (err) reject(err);
				else if (!this.lastID) reject(new FriendshipInvalid())
				else resolve();
			}
		);
	})
}

export const isBlocked = async (sender_id: number, receiver_name: string): Promise<boolean> => {
	const receiver_id = await findUserIdByUsername(receiver_name);
	if (!receiver_id) throw new FriendInvalidCustom("friend was invalid for block check");
	const data = await new Promise<{ blocked_by_inviter: string | null, blocked_by_recipient: string | null, inviter_id: number, recipient_id: number } | undefined>((resolve, reject) => {
		db.get<{ blocked_by_inviter: string | null, blocked_by_recipient: string | null, inviter_id: number, recipient_id: number }>(` \
			SELECT blocked_by_inviter, blocked_by_recipient, recipient_id, inviter_id from friends \
			WHERE status = "accepted" \
			AND ((inviter_id = ? AND recipient_id = ?) \
				OR (inviter_id = ? AND recipient_id = ?))`,
			[sender_id, receiver_id, receiver_id, sender_id],
			(err, row) => {
				if (err) return reject(err);
				if (!row) reject(new FriendshipInvalid());
				else resolve(row);
			}
		);
	})

	const blocked = data?.inviter_id == sender_id ? data?.blocked_by_recipient : data?.blocked_by_inviter;
	return (blocked ? true : false); 
}

export const addGameInvite = async (friendName: string, user_id: number, gameID: string): Promise<void> => {
	const friend_id = await findUserIdByUsername(friendName);
	if (!friend_id) throw new FriendInvalid(friendName);
	await new Promise<void>((resolve, reject) => {
		db.run(
			'UPDATE friends SET game_invite_from = ?, game_invite_id = ? \
			 WHERE status = "accepted" \
			AND ((inviter_id = ? AND recipient_id = ?) \
				OR (inviter_id = ? AND recipient_id = ?))',
			[user_id, gameID, friend_id, user_id, user_id, friend_id],
			function (err) {
				if (err) reject(err);
				else if (this.changes === 0) reject(new FriendshipInvalid())
				else resolve();
			}
		);
	});
}

export const getGameInviteID = async (friendName: string, user_id: number): Promise<string> => {
	const friend_id = await findUserIdByUsername(friendName);
	if (!friend_id) throw new FriendInvalid(friendName);
	return new Promise((resolve, reject) => {
		db.get<{ game_invite_id: string }>(' \
			SELECT game_invite_id from friends \
			WHERE status = "accepted" \
			AND ((inviter_id = ? AND recipient_id = ?) \
				OR (inviter_id = ? AND recipient_id = ?))',
			[friend_id, user_id, user_id, friend_id],
			(err, row) => {
				if (err) return reject(err);
				resolve(row.game_invite_id);
			})
	})
}

export const deleteGameInvite = async (friendName: string, user_id: number): Promise<void> => {
	const friend_id = await findUserIdByUsername(friendName);
	if (!friend_id) throw new FriendInvalid(friendName);
	await new Promise<void>((resolve, reject) => {
		db.run(
			'UPDATE friends SET game_invite_from = ?, game_invite_id = ? \
			 WHERE status = "accepted" \
			AND ((inviter_id = ? AND recipient_id = ?) \
				OR (inviter_id = ? AND recipient_id = ?))',
			[null, null, friend_id, user_id, user_id, friend_id],
			function (err) {
				if (err) reject(err);
				else if (this.changes === 0) reject(new FriendshipInvalid())
				else resolve();
			}
		);
	});
}