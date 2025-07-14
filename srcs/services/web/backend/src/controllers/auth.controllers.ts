import { FastifyReply, FastifyRequest } from "fastify";
import { createUser, findUserByUsername, verifyPassword } from "../services/userService.js";
import { InvalidCredentialsError, InvalidUser, InvalidUsernameError, UserAlreadySignedIn, UserNotFoundError } from "../errors/login.errors.js";
import { ACCESS_TOKEN_SECRET, createCsrfToken, generate2FAAccessToken, generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../services/tokenService.js";
import { validateRegisterInput } from "../services/authService.js";
import { RegisterInputProps } from "../types/registration.js";
import bcrypt from 'bcrypt';
import { AccessTokenInvalidError, NoAccessTokenError, NoRefreshTokenError } from "../errors/middleware.errors.js";
import { playerConnected,  playerDisconnected} from '../plugins/metrics.js';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const TOKEN_EXPIRATION_TIME = 60 * 15 as number; //in sec


export const handleLogout = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	reply
		.clearCookie('token', { path: '/' })
		.clearCookie('refreshToken', { path: '/' })
		.clearCookie('csrf_token', { path: '/' })
		.send({ success: true });
}


export const handleLogin = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	try {
		let { username, password } = req.body as {username: string, password: string};
		username = username.toLowerCase();

		if (username === 'ai') throw new InvalidUser()
		if (req.server.onlineUsers.has(username)) throw new UserAlreadySignedIn()
		const user = await findUserByUsername(username)

		if (!user) throw new UserNotFoundError()

		const valid = await verifyPassword(password, user.password);

		if (!valid) throw new InvalidCredentialsError()

		if (user.two_factor_enabled) {
			const tempToken = generate2FAAccessToken(user);
			return reply.code(202).send({ requires2FA: true, token: tempToken });
		}
		+  playerConnected();
		// Normal login (no 2FA)
		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);
		const csrfToken = createCsrfToken();

		return reply
			.setCookie('token', accessToken, {
				httpOnly: true,
				secure: true, // set to true in production with HTTPS // process.env.NODE_ENV === 'production'
				sameSite: 'strict',
				path: '/',
				maxAge: TOKEN_EXPIRATION_TIME
			})
			.setCookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: true, // set to true in production with HTTPS // process.env.NODE_ENV === 'production'
				sameSite: 'strict',
				path: '/',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			})
			.setCookie('csrf_token', csrfToken, {
				httpOnly: false,
				secure: true, // set to true in production with HTTPS // process.env.NODE_ENV === 'production'
				sameSite: 'strict',
				path: '/',
				maxAge: TOKEN_EXPIRATION_TIME
			})
			 .send({ success: true });
	  	playerDisconnected(); 
	} catch (error) {
		throw error;
	}
}

export const handleRegister = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	try {
		let { username, password } = validateRegisterInput(req.body as RegisterInputProps)
		username = username.toLowerCase();
		const hashed = await bcrypt.hash(password, 10);

		let userId: number;
		try {
			userId = await createUser(username, hashed);
			if (!userId) return;
		} catch {
			throw new InvalidUsernameError();
		}


		const user = { id: userId, username: username};
		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);
		const csrfToken = createCsrfToken();

		playerConnected();
		return reply
			.setCookie('token', accessToken, {
				httpOnly: true,
				secure: true, // set to true in production with HTTPS // process.env.NODE_ENV === 'production'
				sameSite: 'strict',
				path: '/',
				maxAge: TOKEN_EXPIRATION_TIME
			})
			.setCookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: true, // set to true in production with HTTPS
				sameSite: 'strict',
				path: '/',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			})
			.setCookie('csrf_token', csrfToken, {
				httpOnly: false,
				secure: true, // set to true in production with HTTPS
				sameSite: 'strict',
				path: '/',
				maxAge: TOKEN_EXPIRATION_TIME
			})
			.send({ success: true });
	} catch (error) {
		throw error;
	}
}

export const handleRefresh = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	const refreshToken = req.cookies.refreshToken;
	 
	if (!refreshToken) throw new NoRefreshTokenError()

	try {
		const payload = verifyRefreshToken(refreshToken);
		const accessToken = generateAccessToken(payload);
		const csrfToken = createCsrfToken();

		reply
			.setCookie('token', accessToken, {
				httpOnly: true,
				secure: true, // set to true in production with HTTPS
				sameSite: 'strict',
				path: '/',
				maxAge: TOKEN_EXPIRATION_TIME
			})
			.setCookie('csrf_token', csrfToken, {
				httpOnly: false,
				secure: true, // set to true in production with HTTPS
				sameSite: 'strict',
				path: '/',
				maxAge: TOKEN_EXPIRATION_TIME
			})
			.send({ success: true });
	} catch (error) {
		throw error;
	}
}

export const handleTokenInfo = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	
	try {
		const accessToken = req.cookies.token;
		if (!accessToken) throw new AccessTokenInvalidError;
		const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as JwtPayload
		if (!decoded.exp)
			throw new AccessTokenInvalidError
		console.custom('warn', `${req.user.username}'s accessToken expires in ${(decoded.exp * 1000 - Date.now()) / 1000}s`);
		reply.send({ expireTime: decoded.exp })
	} catch (err) {
		throw err;
	}
}