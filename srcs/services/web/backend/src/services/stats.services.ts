import { db } from "../db/connections.js"
import { UserNotFoundError } from "../errors/2fa.errors.js"
import { UserStats } from "../types/user.js"

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
