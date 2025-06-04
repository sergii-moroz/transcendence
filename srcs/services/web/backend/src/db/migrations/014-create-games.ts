import { db } from "../connections.js";

export async function up() {
	return new Promise<void>((resolve, reject) => {
		db.run(`
			CREATE TABLE IF NOT EXISTS games (
				id TEXT PRIMARY KEY NOT NULL,		-- Using TEXT for UUID storage
				game_mode_id INTEGER NOT NULL,
				player1 INTEGER NOT NULL,
				player2 INTEGER NOT NULL,
				score1 INTEGER NOT NULL DEFAULT 0,
				score2 INTEGER NOT NULL DEFAULT 0,
				tech_win BOOLEAN NOT NULL DEFAULT FALSE,
				duration INTEGER NOT NULL,			-- Duration in seconds
				finished_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (player1) REFERENCES users(id),
				FOREIGN KEY (player2) REFERENCES users(id),
				FOREIGN KEY (game_mode_id) REFERENCES game_modes(id)
			);
		`, (err) => {
			if (err) reject(err);
			else resolve();
		});
	});
}
