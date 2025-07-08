import {
	AccessTokenExpiredError,
	AccessTokenInvalidError,
	RefreshTokenExpiredError,
	RefreshTokenInvalidError
} from '../errors/middleware.errors.js';

import crypto from 'crypto'
import { JwtUserPayload } from '../types/user.js';
import jwt from 'jsonwebtoken'
import { TOKEN_EXPIRATION_TIME } from '../controllers/auth.controllers.js';

export const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'supersecret-key-supersecret-key!' as string;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret' as string;
const TWO_FA_ACCESS_TOKEN_SECRET = process.env.JWT_2FA_ACCESS_SECRET || crypto.randomBytes(32).toString('hex') as string

export function generateAccessToken(user: JwtUserPayload): string {
	return jwt.sign({ id: user.id, username: user.username }, ACCESS_TOKEN_SECRET, { expiresIn: `${TOKEN_EXPIRATION_TIME}s` });
	// return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(user: JwtUserPayload): string {
	return jwt.sign({ id: user.id, username: user.username }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
	// return jwt.sign(user, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

export function createCsrfToken() {
	return crypto.randomBytes(24).toString('hex');
}

export function verifyAccessToken(token: string): JwtUserPayload {
	try {
		return jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtUserPayload
	} catch (err) {
		if (err instanceof jwt.TokenExpiredError) throw new AccessTokenExpiredError()
		if (err instanceof jwt.JsonWebTokenError) throw new AccessTokenInvalidError()
		throw err
	}
}

export function verifyRefreshToken(token: string): JwtUserPayload {
	try {
		return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtUserPayload;
	} catch (err) {
		if (err instanceof jwt.TokenExpiredError) throw new RefreshTokenExpiredError()
		if (err instanceof jwt.JsonWebTokenError) throw new RefreshTokenInvalidError()
		throw err
	}
}

export const generate2FAAccessToken = (user: JwtUserPayload): string => {
	return jwt.sign({ id: user.id, username: user.username }, TWO_FA_ACCESS_TOKEN_SECRET, { expiresIn: '5m'})
}

export const verify2FAAccessToken = (token: string) => {
	return jwt.verify(token, TWO_FA_ACCESS_TOKEN_SECRET) as JwtUserPayload
}
