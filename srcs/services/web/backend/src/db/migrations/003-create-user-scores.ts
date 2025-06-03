import { db } from "../connections.js";

export async function up() {
	return new Promise<void>((resolve, reject) => {
		db.run(`
			CREATE TABLE IF NOT EXISTS user_stats (
				user_id INTEGER NOT NULL PRIMARY KEY,
				m_wins INTEGER DEFAULT 0,
				m_losses INTEGER DEFAULT 0,
				t_wins INTEGER DEFAULT 0,
				t_losses INTEGER DEFAULT 0,
				s_wins INTEGER DEFAULT 0,
				s_losses INTEGER DEFAULT 0,
				created_at DATATIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATATIME DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
			)
		`, (err) => {
			if (err) reject(err);
			else resolve();
		});
	});
}
