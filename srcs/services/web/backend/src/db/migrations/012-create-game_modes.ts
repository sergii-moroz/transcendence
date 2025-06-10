import { db } from "../connections.js";

export async function up() {
	return new Promise<void>((resolve, reject) => {
		db.run(`
			CREATE TABLE IF NOT EXISTS game_modes (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				mode TEXT NOT NULL UNIQUE
					CHECK(mode IN ('singleplayer', 'multiplayer', 'tournament'))
			)
		`, (err) => {
			if (err) reject(err);
			else resolve();
		});
	});
}
