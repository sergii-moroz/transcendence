import { FastifyReply, FastifyRequest } from "fastify";
import { createUser, findUserByUsername, verifyPassword } from "../services/userService.js";
import { InvalidCredentialsError, UserNotFoundError } from "../errors/login.errors.js";
import { createCsrfToken, generate2FAAccessToken, generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../services/tokenService.js";
import { validateRegisterInput } from "../services/authService.js";
import { RegisterInputProps } from "../types/registration.js";
import bcrypt from 'bcrypt';
import { NoRefreshTokenError } from "../errors/middleware.errors.js";

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
		const user = await findUserByUsername(username)

		if (!user) throw new UserNotFoundError()

		const valid = await verifyPassword(password, user.password);

		if (!valid) throw new InvalidCredentialsError()

		if (user.two_factor_enabled) {
			const tempToken = generate2FAAccessToken(user);
			return reply.code(202).send({ requires2FA: true, token: tempToken });
		}

		// Normal login (no 2FA)
		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);
		const csrfToken = createCsrfToken();

		return reply
			.setCookie('token', accessToken, {
				httpOnly: true,
				secure: false, // set to true in production with HTTPS // process.env.NODE_ENV === 'production'
				sameSite: 'strict',
				path: '/',
				maxAge: 60 * 15 // 15 min
			})
			.setCookie('refreshToken', refreshToken, {
				httpOnly: true,
				sameSite: 'strict',
				path: '/',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			})
			.setCookie('csrf_token', csrfToken, {
				httpOnly: false,
				sameSite: 'strict',
				path: '/',
				maxAge: 60 * 15
			})
			.send({ success: true });
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

		const userId = await createUser(username, hashed)

		const user = { id: userId, username: username};
		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);
		const csrfToken = createCsrfToken();

		return reply
			.setCookie('token', accessToken, {
				httpOnly: true,
				secure: false, // set to true in production with HTTPS
				sameSite: 'strict',
				path: '/',
				maxAge: 60 * 15 // 15 min
			})
			.setCookie('refreshToken', refreshToken, {
				httpOnly: true,
				sameSite: 'strict',
				path: '/',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			})
			.setCookie('csrf_token', csrfToken, {
				httpOnly: false,
				sameSite: 'strict',
				path: '/',
				maxAge: 60 * 15
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
				sameSite: 'strict',
				path: '/',
				maxAge: 60 * 15
			})
			.setCookie('csrf_token', csrfToken, {
				httpOnly: false,
				sameSite: 'strict',
				path: '/',
				maxAge: 60 * 15
			})
			.send({ success: true });
	} catch (error) {
		throw error;
	}
}