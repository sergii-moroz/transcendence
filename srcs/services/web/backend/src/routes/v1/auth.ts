import {
	createCsrfToken,
	verifyRefreshToken,
	generateAccessToken,
	generateRefreshToken,
	generate2FAAccessToken,
} from "../../services/tokenService.js";

import {
	createUser,
	verifyPassword,
	findUserByUsername,
} from "../../services/userService.js";

import { FastifyInstance, FastifyPluginOptions } from "fastify";
import bcrypt from 'bcrypt'
import { loginSchema, logoutSchema, registerSchema } from "../../schemas/auth.js";
import { authenticate, checkCsrf, validateRegisterInput } from "../../services/authService.js";
import { RegisterInputProps } from "../../types/registration.js";
import { InvalidCredentialsError, UserNotFoundError } from "../../errors/login.errors.js";
import { NoRefreshTokenError } from "../../errors/middleware.errors.js";
import { handleLogout } from "../../controllers/auth.controllers.js";
import { handlePasswordReset } from "../../controllers/api.controller.js";

export const authRoutes = async (app: FastifyInstance, opts: FastifyPluginOptions) => {

	app.post('/register', {schema: registerSchema}, async (req, reply) => {
		try {
			const { username, password } = validateRegisterInput(req.body as RegisterInputProps)
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
		} catch (err) {
			throw err
		}
	});

	app.post('/login', {schema: loginSchema}, async (req, reply) => {
		const { username, password } = req.body as {username: string, password: string};

		try {
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

		} catch (err) {
			throw err
		}
	});

	app.post('/logout', {
		schema:			logoutSchema,
		preHandler:	[authenticate, checkCsrf],
		handler:		handleLogout
	})

	app.get('/user', (req, reply) => {
		reply.send(req.user);
	});

	app.post('/refresh', async (req, reply) => {
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
		} catch (err) {
			throw err
		}
	});

	app.post('/password/reset', {
		preHandler: [authenticate, checkCsrf],
		handler: handlePasswordReset
	})

}
