import { db } from "../connections.js";

export async function up() {
	return new Promise<void>((resolve, reject) => {
		db.run(
			"CREATE INDEX idx_reset_intents_expires ON password_reset_intents (expires_at);",
			(err) => {
				if (err) reject(err);
				else resolve();
			});
	});
}
