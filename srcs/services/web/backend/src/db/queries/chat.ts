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