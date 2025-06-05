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


const DEFAULT_PICTURE_PATH = "/uploads/default.jpg";

export const getFriendChat = async (friendName: string, req: FastifyRequest): Promise<FriendInChat> => {
	const user_id = req.user.id;
	const friend_id = await findUserIdByUsername(friendName);
	if (!friend_id) throw new Error("friend does not exist");
	const FriendData = await new Promise<Friend & { blocked_by_inviter: string | null, blocked_by_recipient: string | null, inviter_id: number, recipient_id: number }>((resolve, reject) => {
		db.get<Friend & { blocked_by_inviter: string | null, blocked_by_recipient: string | null, inviter_id: number, recipient_id: number }>(' \
			SELECT username as name, avatar as picture, blocked_by_inviter, blocked_by_recipient, recipient_id, inviter_id from friends f \
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
				if (!row) return reject(new Error("friend not found"));
				resolve(row);
		})
	})

	const blockStatus = (FriendData.inviter_id == user_id ? FriendData.blocked_by_inviter : FriendData.blocked_by_recipient)

	return {
		name: FriendData.name,
		picture: FriendData.picture || DEFAULT_PICTURE_PATH,
		blocked: blockStatus,
		online: req.server.onlineUsers.has(FriendData.name)
	};
}

export const getOldMessages = async (friendName: string, user_id: number, blocked: string | null): Promise<Message[] | undefined> => {
	const friend_id = await findUserIdByUsername(friendName);
	if (!friend_id) throw new Error("friend does not exist");
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
	return new Promise((resolve, reject) => {
		db.run(
			`INSERT INTO messages (sender_id, receiver_id, text) VALUES (?, ?, ?)`,
			[sender_id, receiver_id, text],
			(err) => {
				if (err) reject(err);
				else resolve();
			}
		);
	})
}

export const isBlocked = async (sender_id: number, receiver_name: string): Promise<boolean> => {
	const receiver_id = await findUserIdByUsername(receiver_name);
	if (!receiver_id) throw new Error("friend does not exist");
	const data = await new Promise<{ blocked_by_inviter: string | null, blocked_by_recipient: string | null, inviter_id: number, recipient_id: number } | undefined>((resolve, reject) => {
		db.get<{ blocked_by_inviter: string | null, blocked_by_recipient: string | null, inviter_id: number, recipient_id: number }>(` \
			SELECT blocked_by_inviter, blocked_by_recipient, recipient_id, inviter_id from friends \
			WHERE status = "accepted" \
			AND ((inviter_id = ? AND recipient_id = ?) \
				OR (inviter_id = ? AND recipient_id = ?))`,
			[sender_id, receiver_id, receiver_id, sender_id],
			(err, row) => {
				if (err) return reject(err);
				if (!row) resolve(undefined);
				else resolve(row);
			}
		);
	})

	if (!data)
		throw new Error("looking up blocked state failed");
	const blocked = data.inviter_id == sender_id ? data.blocked_by_recipient : data.blocked_by_inviter;
	return (blocked ? true: false); 
}