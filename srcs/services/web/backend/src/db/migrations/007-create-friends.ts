import { db } from "../connections.js";

export async function up() {
	return new Promise<void>((resolve, reject) => {
		db.run(`
			CREATE TABLE IF NOT EXISTS friends (
				inviter_id INTEGER NOT NULL,
				recipient_id INTEGER NOT NULL,
				status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'blocked')),
				blocked_by_inviter DATETIME DEFAULT null,
				blocked_by_recipient DATETIME DEFAULT null,
				game_invite_from INTEGER DEFAULT NULL,
				game_invite_id TEXT DEFAULT NULL,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE,
				FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
				CHECK (inviter_id != recipient_id)
				UNIQUE(inviter_id, recipient_id)
			)
		`, (err) => {
			if (err) reject(err);
			else resolve();
		});
	});
}
