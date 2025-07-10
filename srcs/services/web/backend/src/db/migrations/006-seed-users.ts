import { db } from "../connections.js";
import bcrypt from 'bcrypt'

export async function up() {
	return new Promise<void>((resolve, reject) => {
		const users = [
			{ username: 'ai', password: 'password', funFact: 'This is the AI profile.' },
			{ username: 'admin', password: 'password', funFact: 'This is the admin profile.' },
			{ username: 'smoroz', password: 'password', funFact: 'Sergii likes coffee.' },
			{ username: 'tecker', password: 'password', funFact: 'elephant', avatar: "/uploads/hans.jpg" },
			{ username: 'dolifero', password: 'password', funFact: 'Dima is developing a game.', avatar: "/uploads/hans.jpg" },
			{ username: 'olanokhi', password: 'password', funFact: 'Alex likes chocolate.' },
			{ username: 'smoreron', password: 'password', funFact: 'Serhio observes the service.' },
		];

		db.serialize(() => {
			for (const user of users) {
				const hashed = bcrypt.hashSync(user.password, 10);
				db.run(
					`INSERT INTO users (username, password, funFact, avatar) VALUES (?, ?, ?, ?)`,
					[user.username, hashed, user.funFact, user.avatar],
					(err) => {
						if (err) reject(err);
					}
				);
			}
			resolve(); // call once after all .run() calls
		});
	});
}
