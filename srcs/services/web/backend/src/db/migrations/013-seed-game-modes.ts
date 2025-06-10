import { db } from "../connections.js";

export async function up() {
	return new Promise<void>((resolve, reject) => {
		const modes = [
			'singleplayer',
			'multiplayer',
			'tournament',
		];

		db.serialize(() => {
			for (const mode of modes) {
				db.run(
					`INSERT OR IGNORE INTO game_modes (mode) VALUES (?)`,
					[mode],
					(err) => {
						if (err) reject(err);
					}
				);
			}
			resolve();
		});
	});
}
