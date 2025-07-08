import { db } from "../db/connections.js"
import { UserNotFoundError } from "../errors/2fa.errors.js"
import { GAME_MODES } from "../public/types/game-history.types.js"

import {
	GameMode,
	PlayerStats,
	UserStats
} from "../types/user.js"

export const getUserPerformance = async (id: number): Promise<UserStats> => {
	return new Promise((resolve, reject) => {
		db.get<UserStats>(
			`SELECT * FROM user_stats WHERE user_id = ?`,
			[id],
			(err, row) => {
				if (err) return reject (err)
				if (!row) return reject (new UserNotFoundError())
				resolve(row)
			}
		)
	})
}

// Function could return empty array if db is fresh and no games was played
// export const getTopPlayers = async (key: GameMode, limit: number = 3): Promise<PlayerStats[]> => {
// 	const modeColumnMap: Record<GameMode, string> = {
// 		singleplayer: 's', multiplayer: 'm', tournament: 't'
// 	}
// 	const modePrefix = modeColumnMap[key]
// 	const winsCol = `${modePrefix}_wins`
// 	const lossesCol = `${modePrefix}_losses`

// 	return new Promise((resolve, reject) => {
// 		const sql = `
// 			SELECT
// 				users.username,
// 				user_stats.${winsCol} AS wins,
// 				user_stats.${lossesCol} AS losses,
// 				(CAST(user_stats.${winsCol} AS FLOAT) / (user_stats.${winsCol} + user_stats.${lossesCol})) * 100 AS win_rate
// 			FROM user_stats
// 			JOIN users ON user_stats.user_id = users.id
// 			WHERE user_stats.${winsCol} + user_stats.${lossesCol} > 0
// 			ORDER BY win_rate DESC
// 			LIMIT ${limit}
// 		`
// 		db.all<PlayerStats>(sql, [], (err, rows) => {
// 				if (err) return reject (err)
// 				// if (!rows || rows.length === 0) return reject(new UserNotFoundError())
// 				resolve(rows)
// 			}
// 		)
// 	})
// }

// Wilson Score Interval
// This statistical method gives a confidence interval for binomial proportions (like win rates):
export const getTopPlayers = async (key: GameMode, limit: number = 3): Promise<PlayerStats[]> => {
	const modeColumnMap: Record<GameMode, string> = {
		singleplayer: 's', multiplayer: 'm', tournament: 't'
	}
	const modePrefix = modeColumnMap[key]
	const winsCol = `${modePrefix}_wins`
	const lossesCol = `${modePrefix}_losses`

	return new Promise((resolve, reject) => {
		const sql = `
			SELECT
				users.username,
				user_stats.${winsCol} AS wins,
				user_stats.${lossesCol} AS losses,
				(CAST(user_stats.${winsCol} AS FLOAT) / (user_stats.${winsCol} + user_stats.${lossesCol})) * 100 AS win_rate,
				(
					(user_stats.${winsCol} + 1.9208) / (user_stats.${winsCol} + user_stats.${lossesCol}) -
					1.96 * SQRT(
							(user_stats.${winsCol} * user_stats.${lossesCol}) /
							(user_stats.${winsCol} + user_stats.${lossesCol}) + 0.9604
					) /
					(user_stats.${winsCol} + user_stats.${lossesCol})
				) / (1 + 3.8416 / (user_stats.${winsCol} + user_stats.${lossesCol})) AS wilson_score
			FROM user_stats
			JOIN users ON user_stats.user_id = users.id
			WHERE user_stats.${winsCol} + user_stats.${lossesCol} > 0
			ORDER BY wilson_score DESC
			LIMIT ?
		`
		db.all<PlayerStats>(sql, [limit], (err, rows) => {
				if (err) return reject (err)
				// if (!rows || rows.length === 0) return reject(new UserNotFoundError())
				resolve(rows)
			}
		)
	})
}

export const updatePlayerStats = async ( winnerId: string, loserId: string, key: GAME_MODES): Promise<void> => {
	const modeColumnMap: Record<GAME_MODES, string> = {
		1: 's', 2: 'm', 3: 't'
	}
	const prefix = modeColumnMap[key]
	const winsCol = `${prefix}_wins`
	const lossesCol = `${prefix}_losses`

	return new Promise((resolve, reject) => {
		// Execute both updates as a transaction
		db.serialize(() => {
			db.run("BEGIN TRANSACTION");

			// Update winner's wins
			db.run(
				`UPDATE user_stats SET ${winsCol} = ${winsCol} + 1 WHERE user_id = ?`,
				[winnerId],
				(err) => {
					if (err) {
						db.run("ROLLBACK");
						return reject(err);
					}
				}
			);

			// Update loser's losses
			db.run(
				`UPDATE user_stats SET ${lossesCol} = ${lossesCol} + 1 WHERE user_id = ?`,
				[loserId],
				(err) => {
					if (err) {
						db.run("ROLLBACK");
						return reject(err);
					}
				}
			);

			db.run("COMMIT", (err) => {
				if (err) {
					db.run("ROLLBACK");
					return reject(err);
				}
				resolve();
			});
		});
	});
}
