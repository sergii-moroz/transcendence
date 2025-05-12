import { db } from "../db/connections.js";

export const updateTwoFASecret = async (username: string, secret: string): Promise<void> => {
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
