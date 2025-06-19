import { db } from "../connections.js";
import bcrypt from 'bcrypt'

export async function up() {
	return new Promise<void>((resolve, reject) => {
		const users = [
			{ username: 'ai', password: 'password', bio: 'This is the AI profile.' },
			{ username: 'admin', password: 'password', bio: 'This is the admin profile.' },
			{ username: 'smoroz', password: 'password', bio: 'Sergii likes coffee.' },
			{ username: 'olanokhi', password: 'password', bio: 'Alex likes chocolate.' },
			{ username: 'tecker', password: 'password', bio: 'Tom writes code.' },
			{ username: 'smoreron', password: 'password', bio: 'Serhio observes the service.' },
			{ username: 'dolifero', password: 'password', bio: 'Dima is developing a game.', avatar: "/uploads/hans.jpg" },
		];

		db.serialize(() => {
			for (const user of users) {
				const hashed = bcrypt.hashSync(user.password, 10);
				db.run(
					`INSERT INTO users (username, password, bio, avatar) VALUES (?, ?, ?, ?)`,
					[user.username, hashed, user.bio, user.avatar],
					(err) => {
						if (err) reject(err);
					}
				);
			}
			resolve(); // call once after all .run() calls
		});
	});
}
