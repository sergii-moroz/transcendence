import { db } from "../connections.js";

export async function up() {
	return new Promise<void>((resolve, reject) => {
		const indexes = [
			"CREATE INDEX IF NOT EXISTS idx_games_game_modes_id ON game_modes(mode);",	// Speeds up queries filtering by game mode
			"CREATE INDEX IF NOT EXISTS idx_games_finished_at ON games(finished_at);",	// Essential for sorting/filtering by game time
			"CREATE INDEX IF NOT EXISTS idx_games_player1 ON games(player1);",					// For player statistics queries
			"CREATE INDEX IF NOT EXISTS idx_games_player2 ON games(player2);",					//
			"CREATE INDEX IF NOT EXISTS idx_games_scores ON games(score1, score2);"			// For score-based leaderboards
		];

		db.serialize(() => {
			for (const index of indexes) {
				db.run(
					index,
					(err) => {
						if (err) reject(err);
					}
				);
			}
			resolve();
		});
	});
}
