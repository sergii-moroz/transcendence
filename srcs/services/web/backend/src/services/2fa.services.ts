import {
	HashingError,
	Invalid2FACodeError,
	Missing2FACodeError,
	SecretNotFoundError
} from "../errors/2fa.errors.js";

import { UserNotFoundError } from "../errors/login.errors.js";
import { JwtUserPayload, User } from "../types/user.js";
import { db } from "../db/connections.js";
import { authenticator } from "otplib";
import QRCode from 'qrcode'
import bcrypt from 'bcrypt'

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

export const generate2FASecretAndQRCode = async (user: JwtUserPayload) => {
	let secret = await get2FASecret(user.id)

	if (!secret) {
		secret = authenticator.generateSecret();
		await update2FASecret(user.username, secret)
	}

	const otpauth = authenticator.keyuri(user.username, 'ft_transcendence', secret);
	const qr = await QRCode.toDataURL(otpauth);

	return { qr, secret }
}

export const verifyGACode = async (userId: number, code?: string) => {

	if (!code) {
		throw new Missing2FACodeError()
	}

	const secret = await get2FASecret(userId)

	if (!secret) throw new SecretNotFoundError()

	const isValid = authenticator.check(code, secret)

	if (!isValid) throw new Invalid2FACodeError()

	await mark2FAVerified(userId)

	return { success: true }
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

export const generateBackupCodesService = async (userId: number) => {
	const codes = generateBackupCodes()

	let codesHashed: string[]

	try {
		codesHashed = await Promise.all(
			codes.map(async (code) => await bcrypt.hash(code, 6))
		)
	} catch (err) {
		throw new HashingError()
	}

	const codesStr = JSON.stringify(codesHashed)
	await setBackupCodes(codesStr, userId)

	return (codes)
}

export const setBackupCodes = async (codesStr: string, id: number):Promise<void> => {
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
				if (!row) return reject(new UserNotFoundError())
				resolve(row.two_factor_enabled)
			}
		)
	})
}
