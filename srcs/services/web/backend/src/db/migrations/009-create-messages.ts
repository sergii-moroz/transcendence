import { db } from "../connections.js";

export async function up() {
	return new Promise<void>((resolve, reject) => {
		db.run(`
			CREATE TABLE IF NOT EXISTS messages (
				sender_id INTEGER NOT NULL,
				receiver_id INTEGER NOT NULL,
				text TEXT NOT NULL,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
				FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
				CHECK (receiver_id != sender_id)
			)
		`, (err) => {
			if (err) reject(err);
			else resolve();
		});
	});
}
