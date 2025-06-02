import { db } from "../db/connections.js"
import { UserNotFoundError } from "../errors/2fa.errors.js"

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

export const getTopPlayers = async (key: GameMode): Promise<PlayerStats[]> => {
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
				(CAST(user_stats.${winsCol} AS FLOAT) / (user_stats.${winsCol} + user_stats.${lossesCol})) * 100 AS win_rate
			FROM user_stats
			JOIN users ON user_stats.user_id = users.id
			WHERE user_stats.${winsCol} + user_stats.${lossesCol} > 0
			ORDER BY win_rate DESC
			LIMIT 3
		`
		db.all<PlayerStats>(sql, [], (err, rows) => {
				if (err) return reject (err)
				if (!rows || rows.length === 0) return reject(new UserNotFoundError())
				resolve(rows)
			}
		)
	})
}
