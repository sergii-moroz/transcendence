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

import { verify2FASchema } from "../../schemas/2fa-schemas.js";
import { JwtUserPayload } from "../../types/user.js";
import { authenticator } from "otplib";
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
}
