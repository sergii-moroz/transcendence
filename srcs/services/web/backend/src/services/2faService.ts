import { db } from "../db/connections.js";
import { User } from "../types/user.js";

export const update2FASecret = async (username: string, secret: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		db.run(
			`UPDATE users SET two_factor_secret = ? WHERE username = ?`,
			[secret, username],
			function (err) {
				if (err) return reject(err);
				resolve();
			}
		);
	});
};

export const load2FASecret = async (id: number): Promise<string | undefined> => {
	return new Promise((resolve, reject) => {
		db.get<User>(
			'SELECT two_factor_secret FROM users WHERE id = ?',
			[id],
			(err, row) => {
				if (err) return reject(err);
				if (!row) return resolve(undefined);
				resolve(row.two_factor_secret);
		})
	})
}

export const mark2FAVerified = async (id: number): Promise<void> => {
	return new Promise((resolve, reject) => {
		db.run(
			'UPDATE users SET two_factor_verified = ? WHERE id = ?',
			[true, id],
			(err) => {
				if (err) return reject(err);
				resolve();
			}
		);
	});
};
