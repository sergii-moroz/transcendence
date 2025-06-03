import { db } from "../connections.js";
import bcrypt from 'bcrypt'

// just for debugging right now

export async function up() {
	return new Promise<void>((resolve, reject) => {
		const messages = [
			{ sender_id: '4', receiver_id: '5', text: 'hello' },
			// { sender_id: '3', receiver_id: '4', status: 'pending' },
			{ sender_id: '5', receiver_id: '4', text: 'hi' },
			{ sender_id: '4', receiver_id: '5', text: 'bye' }
		];

		db.serialize(() => {
			for (const message of messages) {
				db.run(
					`INSERT INTO messages (sender_id, receiver_id, text) VALUES (?, ?, ?)`,
					[message.sender_id, message.receiver_id, message.text],
					(err) => {
						if (err) reject(err);
					}
				);
			}
			resolve(); // call once after all .run() calls
		});
	});
}
