import { db } from "../connections.js";
import bcrypt from 'bcrypt'

export async function up() {
	return new Promise<void>((resolve, reject) => {

		db.serialize(() => {
			const hashed = bcrypt.hashSync("password", 10);
			for (let i=0; i<100; i++) {
				db.run(
					`UPDATE user_stats SET
						m_wins = ?,
						m_losses = ?,
						t_wins = ?,
						t_losses = ?,
						s_wins = ?,
						s_losses = ?
					WHERE user_id = ?`,
					[Math.floor(Math.random() * 100) + 1, Math.floor(Math.random() * 100) + 1,
						Math.floor(Math.random() * 100) + 1, Math.floor(Math.random() * 100) + 1,
						Math.floor(Math.random() * 100) + 1, Math.floor(Math.random() * 100) + 1, i + 6],
					(err) => {
						if (err) reject(err);
					}
				);
			}
			resolve(); // call once after all .run() calls
		});
	});
}
