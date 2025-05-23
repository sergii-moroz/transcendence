import {
	createCsrfToken,
	verifyRefreshToken,
	generateAccessToken,
	generateRefreshToken,
	generate2FAAccessToken,
} from "../../services/tokenService.js";

import {
	createUser,
	findUserById,
	verifyPassword,
	findUserByUsername,
} from "../../services/userService.js";

import { FastifyInstance, FastifyPluginOptions } from "fastify";
import bcrypt from 'bcrypt'
// import { createUser, findUserByUsername, verifyPassword } from "../../services/userService.js";
// import { createCsrfToken, generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../services/tokenService.js";
import { loginSchema, registerSchema } from "../../schemas/auth.js";
import { JwtUserPayload } from "../../types/user.js";
import { checkCsrf } from "../../services/authService.js";

export const authRoutes = async (app: FastifyInstance, opts: FastifyPluginOptions) => {

	app.post('/register', {schema: registerSchema}, async (req, reply) => {
		const { username, password } = req.body as {username: string, password: string};
		const hashed = await bcrypt.hash(password, 10);

		try {
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
		} catch (err) {
			console.error('Register error:', err);
			return reply.code(400).send({ error: 'User already exists or error occurred' });
		}
	});

	app.post('/login', {schema: loginSchema}, async (req, reply) => {
		const { username, password } = req.body as {username: string, password: string};

		try {
			const user = await findUserByUsername(username)

			if (!user) return reply.code(401).send({ error: `User ${username} is not found` });

			const valid = await verifyPassword(password, user.password);
			if (!valid) return reply.code(401).send({ error: 'Invalid credentials' });

			if (user.two_factor_enabled) {
				const tempToken = generate2FAAccessToken(user);
				// app.log.info(tempToken)
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

		} catch (err) {
			console.error('Login error:', err);
			return reply.code(500).send({ error: 'Internal server error' });
		}
	});

	app.post('/logout', { preHandler: [checkCsrf] }, (req, reply) => {
		reply
			.clearCookie('token', { path: '/' })
			.clearCookie('refreshToken', { path: '/' })
			.clearCookie('csrf_token', { path: '/' })
			.send({ success: true });
	});

	app.get('/user', (req, reply) => {
		reply.send(req.user);
	});

	app.post('/refresh', async (req, reply) => {
		const refreshToken = req.cookies.refreshToken;
		if (!refreshToken) return reply.code(401).send({ error: 'No refresh token' });

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
		} catch (err) {
			return reply.code(401).send({ error: 'Invalid or expired refresh token' });
		}
	});

}
