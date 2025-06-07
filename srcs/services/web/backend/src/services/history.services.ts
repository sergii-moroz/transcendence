import { db } from "../db/connections.js"

interface GameHistoryProps {
	id: string,
	player1_name: string,
	player2_name: string,
	score1: number,
	score2: number,
	duration: number,
	techWin: boolean,
	finished_at: string
}

export const getUserPlayHistoryPingPongCount = async (id: number, gameMode: number): Promise<number> => {
	return new Promise((resolve, reject) => {
		const sql = `
			SELECT COUNT(*) as count
			FROM games g
			WHERE (g.player1 = ? OR g.player2 = ?)
				AND g.game_mode_id = ?
		`

		db.get<{count: number}>(sql, [id, id, gameMode], (err, row) => {
			if (err) return reject(err)
			resolve(row?.count || 0)
		})
	})
}

export const getUserPlayHistoryPingPongPaginated = async (
	id: number,
	gameMode: number,
	page: number = 1,
	pageSize: number = 5,
): Promise<GameHistoryProps[]> => {
	return new Promise((resolve, reject) => {
		const offset = (page - 1) * pageSize

		const sql = `
			SELECT
				g.id,
				g.score1,
				g.score2,
				g.tech_win,
				g.duration,
				g.finished_at,
				p1.username AS player1_name,
				p2.username AS player2_name
			FROM games g
			JOIN users p1 ON g.player1 = p1.id
			JOIN users p2 ON g.player2 = p2.id
			WHERE (g.player1 = ? OR g.player2 = ?)
				AND g.game_mode_id = ?
			ORDER BY g.finished_at DESC
			LIMIT ? OFFSET ?
		`

		db.all<GameHistoryProps>(sql, [id, id, gameMode, pageSize, offset], (err, rows) => {
				if (err) return reject(err)
				resolve(rows)
			}
		)
	})
}
