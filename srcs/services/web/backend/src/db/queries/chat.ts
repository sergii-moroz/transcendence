import { findUserIdByUsername } from "../../services/userService.js";
import { Message } from "../../types/user.js";
import { db } from "../connections.js";


export const getOldMessages = async (friendName: string, user_id: number, blocked: string | null): Promise<Message[]> => {
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