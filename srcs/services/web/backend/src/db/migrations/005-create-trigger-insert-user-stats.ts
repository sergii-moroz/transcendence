import { db } from "../connections.js";

export async function up() {
	return new Promise<void>((resolve, reject) => {
		db.run(`
			--trigger will automatically insert a default stats values for newly created user
			CREATE TRIGGER IF NOT EXISTS trg_insert_user_stats
			AFTER INSERT ON users
			FOR EACH ROW
			BEGIN
				INSERT INTO user_stats (user_id)
				VALUES (NEW.id);
			END;
		`, (err) => {
			if (err) reject(err);
			else resolve();
		});
	});
}
