import { db } from "../connections.js";

export async function up() {
	return new Promise<void>((resolve, reject) => {
		db.run(`
			-- Trigger using milliseconds comparison
			CREATE TRIGGER cleanup_expired_intents
			BEFORE INSERT ON password_reset_intents
			BEGIN
					DELETE FROM password_reset_intents
					WHERE expires_at < (strftime('%s','now') * 1000);
			END;
		`, (err) => {
			if (err) reject(err);
			else resolve();
		});
	});
}
