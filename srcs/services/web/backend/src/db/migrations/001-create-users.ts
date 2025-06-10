import { db } from "../connections.js";

export async function up() {
	return new Promise<void>((resolve, reject) => {
		db.run(`
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				username TEXT UNIQUE NOT NULL,
				password TEXT NOT NULL,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				avatar TEXT DEFAULT NULL,
				bio TEXT DEFAULT 'Hello, I am new here!'
			)
		`, (err) => {
			if (err) reject(err);
			else resolve();
		});
	});
}
