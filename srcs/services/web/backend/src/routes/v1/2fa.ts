import {
	FastifyInstance,
	FastifyPluginOptions
} from "fastify";

import {
	authenticate,
	checkCsrf
} from "../../services/authService.js";

import {
	generateBackupCodes,
	get2FASecret,
	is2FAEnabled,
	mark2FAEnabled,
	mark2FAVerified,
	setBackupCodes,
	update2FASecret
} from "../../services/2faService.js";

import {
	Invalid2FACodeError,
	Missing2FACodeError,
	SecretNotFoundError
} from "../../errors/errors_2fa.js";

import {
	createCsrfToken,
	generateAccessToken,
	generateRefreshToken,
	verify2FAAccessToken
} from "../../services/tokenService.js";

import { verify2FASchema } from "../../schemas/2fa-schemas.js";
import { JwtUserPayload } from "../../types/user.js";
import { authenticator } from "otplib";
import { findUserById } from "../../services/userService.js";
import QRCode from 'qrcode'

export const twoFARoutes = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
	app.post('/register', {preHandler: [authenticate, checkCsrf]}, async (req, reply) => {
		try {
			const user = req.user as JwtUserPayload;

			let secret = await get2FASecret(user.id)

			if (!secret) {
				secret = authenticator.generateSecret();
				await update2FASecret(user.username, secret)
			}

			const otpauth = authenticator.keyuri(user.username, 'ft_transcendence', secret);
			const qr = await QRCode.toDataURL(otpauth);

			reply.send({ qr, secret });
		} catch (err) {
			throw err
		}
	});

	app.post('/verify', {schema: verify2FASchema, preHandler: [authenticate, checkCsrf]}, async (req, reply) => {
		try {
			const user = req.user as JwtUserPayload
			const { code } = req.body as { code?: string };

			if (!code) {
				throw new Missing2FACodeError()
			}

			const secret = await get2FASecret(user.id)

			if (!secret) throw new SecretNotFoundError()

			const isValid = authenticator.check(code, secret)

			if (!isValid) throw new Invalid2FACodeError()

			await mark2FAVerified(user.id)

			reply.send({ success: true });
		} catch (err) {
			throw err
		}
	})

	app.post('/backup-codes', {preHandler: [authenticate, checkCsrf]}, async (req, reply) => {

		try {

			const user = req.user as JwtUserPayload
			const codes = generateBackupCodes()
			const codesStr = JSON.stringify(codes)

			await setBackupCodes(codesStr, user.id)
			reply.send({codes})

		} catch (err) {
			throw err
		}

	})

	app.post('/enable', {preHandler: [authenticate, checkCsrf]}, async (req, reply) => {
		try {

			const user = req.user as JwtUserPayload

			await mark2FAEnabled(user.id)
			reply.send({ success: true })

		} catch (err) {
			throw err
		}
	})

	app.get('/enable', async (req, reply) => {
		const user = req.user as JwtUserPayload;
		const isEnabled = await is2FAEnabled(user.id)
		app.log.info(isEnabled, "Enabled!!!")
		reply.send({ enabled: isEnabled })
	});

	app.post('/verify-login', async (req, reply) => {
		// app.log.info("verify-login")
		const { token, code } = req.body as { token: string, code: string }
		// app.log.info(token, "TOKEN =====")
		// app.log.info(code, "CODE")

		try {
			const user = verify2FAAccessToken(token)
			// app.log.info(user, "USER:")
			const userFullData = await findUserById(user.id)
			// app.log.info(userFullData, "userFullData:")

			if (!userFullData || !userFullData.two_factor_enabled) {
				return reply.code(401).send({error: 'Unauthorized'})
			}

			// const secret = await get2FASecret(user.id)
			userFullData.two_factor_secret

			if (!userFullData.two_factor_secret) throw new SecretNotFoundError()

			const isValid = authenticator.check(code, userFullData.two_factor_secret)

			if (!isValid) throw new Invalid2FACodeError()

			// Passed all checks -> Generate access/refresh Tokens
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
	})
}
