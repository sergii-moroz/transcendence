import crypto from 'crypto'
import { JwtUserPayload } from '../types/user.js';
import jwt from 'jsonwebtoken'

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'supersecret-key-supersecret-key!' as string;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret' as string;
const TWO_FA_ACCESS_TOKEN_SECRET = process.env.JWT_2FA_ACCESS_SECRET || crypto.randomBytes(32).toString('hex') as string

export function generateAccessToken(user: JwtUserPayload): string {
	return jwt.sign({ id: user.id, username: user.username }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
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
	return jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtUserPayload;
}

export function verifyRefreshToken(token: string): JwtUserPayload {
	return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtUserPayload;
}

export const generate2FAAccessToken = (user: JwtUserPayload): string => {
	return jwt.sign(user, TWO_FA_ACCESS_TOKEN_SECRET, { expiresIn: '5m'})
}

export const verify2FAAccessToken = (token: string) => {
	return jwt.verify(token, TWO_FA_ACCESS_TOKEN_SECRET) as JwtUserPayload
}
