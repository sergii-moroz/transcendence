import { db } from "../connections.js";

export async function up() {
	return new Promise<void>((resolve, reject) => {
		db.run(`
			CREATE TRIGGER IF NOT EXISTS prevent_reverse_friendship
			BEFORE INSERT ON friends
			WHEN EXISTS (
				SELECT 1 FROM friends
				WHERE inviter_id = NEW.recipient_id and recipient_id = NEW.inviter_id
			)
			BEGIN
				SELECT RAISE(ABORT, 'Friendship already exists in reverse direction');
			END;
		`, (err) => {
			if (err) reject(err);
			else resolve();
		});
	});
}
