import { db } from "../connections.js";
import bcrypt from 'bcrypt'

// just for debugging right now

export async function up() {
	return new Promise<void>((resolve, reject) => {
		const friends = [
			{ user_id: '1', friend_id: '4', status: 'accepted' },
			// { user_id: '3', friend_id: '4', status: 'pending' },
			{ user_id: '2', friend_id: '4', status: 'pending' },
			{ user_id: '4', friend_id: '5', status: 'accepted' }
		];

		db.serialize(() => {
			for (const friend of friends) {
				db.run(
					`INSERT INTO friends (inviter_id, recipient_id, status) VALUES (?, ?, ?)`,
					[friend.user_id, friend.friend_id, friend.status],
					(err) => {
						if (err) reject(err);
					}
				);
			}
			resolve(); // call once after all .run() calls
		});
	});
}
