import { db } from "../connections.js";
import bcrypt from 'bcrypt'

export async function up() {
	return new Promise<void>((resolve, reject) => {
		const users = [
			{ username: 'admin', password: 'password', bio: 'This is the admin profile.' },
			{ username: 'smoroz', password: 'password', bio: 'smoroz likes coffee.' },
			{ username: 'olanokhi', password: 'password', bio: 'Alex likes chocolate.' },
			{ username: 'tecker', password: 'password', bio: 'Tom writes code.' },
			{ username: 'dolifero', password: 'password', bio: 'Dima is developing a game.' },
		];

		db.serialize(() => {
			let completed = 0;
			const total = users.length;
			for (const user of users) {
				const hashed = bcrypt.hashSync(user.password, 10);
				db.run(
					`INSERT INTO users (username, password, bio) VALUES (?, ?, ?)`,
					[user.username, hashed, user.bio],
					function (err) { // Use function to access 'this'
						if (err) return reject(err);
						const userId = this.lastID;
						db.run(
							'INSERT INTO user_stats (user_id) VALUES (?)',
							[userId],
							(err) => {
								if (err) return reject(err);
								completed++;
								if (completed === total) resolve();
							}
						);
					}
				);
			}
			resolve(); // call once after all .run() calls
		});
	});
}
