import {
	FastifyInstance,
	FastifyPluginOptions
} from "fastify";

import {
	authenticate,
	checkCsrf
} from "../../services/authService.js";

import {
	generate2FASecretAndQRCode,
	generateBackupCodes,
	get2FASecret,
	is2FAEnabled,
	mark2FAEnabled,
	mark2FAVerified,
	setBackupCodes,
	update2FASecret
} from "../../services/2fa.services.js";

import {
	Invalid2FACodeError,
	Missing2FACodeError,
	SecretNotFoundError
} from "../../errors/2fa.errors.js";

import {
	gaRegisterSchema,
	generateBackupCodesSchema,
	set2FAEnabledSchema,
	verify2FASchema
} from "../../schemas/2fa.schemas.js";

import {
	handleGARegister,
	handleGAVerify,
	handleGenerateBackupCodes,
	handleSet2FAEnabled
} from "../../controllers/2fa.controllers.js";

import {
	createCsrfToken,
	generateAccessToken,
	generateRefreshToken,
	verify2FAAccessToken
} from "../../services/tokenService.js";

import { JwtUserPayload } from "../../types/user.js";
import { findUserById } from "../../services/userService.js";
import { authenticator } from "otplib";

export const twoFARoutes = async (app: FastifyInstance, opts: FastifyPluginOptions) => {

	app.post('/ga/register', {
		schema:			gaRegisterSchema,
		preHandler:	[authenticate, checkCsrf],
		handler:		handleGARegister
	})

	app.post('/ga/verify', {
		schema:			verify2FASchema,
		preHandler:	[authenticate, checkCsrf],
		handler:		handleGAVerify
	})

	app.post('/backup-codes', {
		schema:			generateBackupCodesSchema,
		preHandler:	[authenticate, checkCsrf],
		handler:		handleGenerateBackupCodes
	})

	// Do i need auth verification here?
	app.get('/enabled', async (req, reply) => {
		const user = req.user as JwtUserPayload;
		const isEnabled = await is2FAEnabled(user.id)
		reply.send({ enabled: isEnabled, success: true })
	});

	app.post('/enabled', {
		schema: set2FAEnabledSchema,
		preHandler: [authenticate, checkCsrf],
		handler: handleSet2FAEnabled
	})

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
