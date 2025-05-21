import { db } from "../connections.js";

export async function up() {
	return new Promise<void>((resolve, reject) => {
		db.run(`
			CREATE TABLE IF NOT EXISTS user_stats (
				user_id INTEGER NOT NULL,
				wins INTEGER DEFAULT 0,
				losses INTEGER DEFAULT 0,
				t_wins INTEGER DEFAULT 0,
				t_losses INTEGER DEFAULT 0,
				FOREIGN KEY (user_id) REFERENCES users(id)
			)
		`, (err) => {
			if (err) reject(err);
			else resolve();
		});
	});
}
