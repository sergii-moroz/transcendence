import { db } from "../connections.js";

export async function up() {
	return new Promise<void>((resolve, reject) => {
		db.serialize(() => {
			db.run(`ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;`);
			db.run(`ALTER TABLE users ADD COLUMN two_factor_secret TEXT;`);
			db.run(`ALTER TABLE users ADD COLUMN two_factor_backup_codes TEXT;`);
			db.run(`ALTER TABLE users ADD COLUMN two_factor_backup_at BOOLEAN;`);
			db.run(`ALTER TABLE users ADD COLUMN two_factor_verified BOOLEAN DEFAULT FALSE;`, (err) => {
				if (err) reject(err);
				else resolve();
			});
		});
	});
}
