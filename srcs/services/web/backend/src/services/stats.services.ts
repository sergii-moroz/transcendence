import { db } from "../db/connections.js"
import { UserNotFoundError } from "../errors/2fa.errors.js"
import { MultiPlayerStats, TournamentStats, UserStats } from "../types/user.js"

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

export const getMultiTopPlayers = async (): Promise<MultiPlayerStats[]> => {
	return new Promise((resolve, reject) => {
		db.all<MultiPlayerStats>(`
			SELECT
				users.username,
				user_stats.m_wins,
				user_stats.m_losses,
				(CAST(m_wins AS FLOAT) / (m_wins + m_losses)) * 100 AS m_win_rate
			FROM user_stats
			JOIN users ON user_stats.user_id = users.id
			WHERE m_wins + m_losses > 0
			ORDER BY m_win_rate DESC
			LIMIT 3`,
			[],
			(err, rows) => {
				if (err) return reject (err)
				if (!rows || rows.length === 0) return reject(new UserNotFoundError())
				resolve(rows)
			}
		)
	})
}

export const getTournamentTopPlayers = async (): Promise<TournamentStats[]> => {
	return new Promise((resolve, reject) => {
		db.all<TournamentStats>(`
			SELECT
				users.username,
				user_stats.t_wins,
				user_stats.t_losses,
				(CAST(t_wins AS FLOAT) / (t_wins + t_losses)) * 100 AS t_win_rate
			FROM user_stats
			JOIN users ON user_stats.user_id = users.id
			WHERE t_wins + t_losses > 0
			ORDER BY t_win_rate DESC
			LIMIT 3`,
			[],
			(err, rows) => {
				if (err) return reject (err)
				if (!rows || rows.length === 0) return reject(new UserNotFoundError())
				resolve(rows)
			}
		)
	})
}
