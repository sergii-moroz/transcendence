import { db } from "../connections.js";

export async function up() {
	return new Promise<void>((resolve, reject) => {
		db.run(`
			CREATE TABLE password_reset_intents (
				temp_token TEXT PRIMARY KEY NOT NULL,
				user_id INTEGER NOT NULL,
				hashed_password TEXT NOT NULL,
				created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
				expires_at TIMESTAMP NOT NULL,
				FOREIGN KEY (user_id) REFERENCES users(id)
			);
		`, (err) => {
			if (err) reject(err);
			else resolve();
		});
	});
}
