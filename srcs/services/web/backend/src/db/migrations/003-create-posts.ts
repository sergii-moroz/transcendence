import { db } from "../connections.js";

export async function up() {
	return new Promise<void>((resolve, reject) => {
		db.run(`
			CREATE TABLE IF NOT EXISTS posts (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user_id INTEGER,
				title TEXT NOT NULL,
				content TEXT NOT NULL,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY(user_id) REFERENCES users(id)
			)
		`, (err) => {
			if (err) reject(err);
			else resolve();
		});
	});
}
