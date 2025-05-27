import { db } from "../connections.js";

export async function up() {
	return new Promise<void>((resolve, reject) => {
		db.run(`
			--trigger will automatically set updated_at to the current time whenever the row is updated
			CREATE TRIGGER IF NOT EXISTS trg_update_user_stats_updated_at
			AFTER UPDATE ON user_stats
			FOR EACH ROW
			BEGIN
				UPDATE user_stats
				SET updated_at = CURRENT_TIMESTAMP
				WHERE user_id = OLD.user_id;
			END;
		`, (err) => {
			if (err) reject(err);
			else resolve();
		});
	});
}
