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

export const get2FASecret = async (id: number): Promise<string | undefined> => {
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

// export const is2FAVerified = async (id: number): Promise<boolean> => {
// 	return new Promise((resolve, reject) => {
// 		db.get<User>(
// 			'SELECT two_factor_verified FROM users WHERE id = ?',
// 			[id],
// 			(err, row) => {
// 				if (err) return reject(err)
// 				if (!row) return resolve(false)
// 				resolve(row.two_factor_verified)
// 			}
// 		)
// 	})
// }

export const generateBackupCodes = (count = 10): string[] => {
	return Array.from({ length: count }, () =>
		Math.random().toString(36).slice(-10).toUpperCase()
	)
}

export const setBackupCodes = async (codesStr: string, id:number):Promise<void> => {
	return new Promise ((resolve, reject) => {
		db.run(
			'UPDATE users SET two_factor_backup_codes = ?, two_factor_backup_at = ? WHERE id = ?',
			[codesStr, new Date().toISOString(), id],
			(err) => {
				if (err) return reject(err)
				resolve()
			}
		)
	})
}

export const mark2FAEnabled = async (id: number): Promise<void> => {
	return new Promise((resolve, reject) => {
		db.run(
			'UPDATE users SET two_factor_enabled = ? WHERE id = ?',
			[true, id],
			(err) => {
				if (err) return reject(err);
				resolve();
			}
		);
	});
};

export const is2FAEnabled = async (id: number): Promise<boolean> => {
	return new Promise((resolve, reject) => {
		db.get<User>(
			'SELECT two_factor_enabled FROM users WHERE id = ?',
			[id],
			(err, row) => {
				if (err) return reject(err)
				if (!row) return resolve(false)
				resolve(row.two_factor_enabled)
			}
		)
	})
}
