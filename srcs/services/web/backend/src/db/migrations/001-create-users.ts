import { db } from "../connections.js";

export async function up() {
	return new Promise<void>((resolve, reject) => {
		db.run(`
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				username TEXT UNIQUE NOT NULL,
				password TEXT NOT NULL,
				avatar TEXT DEFAULT NULL,
				funFact TEXT DEFAULT NULL,
				created_at_user DATETIME DEFAULT CURRENT_TIMESTAMP
			)
		`, (err) => {
			if (err) reject(err);
			else resolve();
		});
	});
}
