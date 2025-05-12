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
	load2FASecret,
	mark2FAVerified,
	markTwoFactorEnabled,
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
			const secret = authenticator.generateSecret();
			const otpauth = authenticator.keyuri(user.username, 'ft_transcendence', secret);
			const qr = await QRCode.toDataURL(otpauth);

			await update2FASecret(user.username, secret)

			reply.send({ qr, secret });
		} catch (err) {
			reply.code(500).send({ error: 'Failed to register 2FA' });
		}
	});

	app.post('/verify', {schema: verify2FASchema, preHandler: [authenticate, checkCsrf]}, async (req, reply) => {
		try {
			const user = req.user as JwtUserPayload
			const { code } = req.body as { code?: string };

			if (!code) {
				throw new Missing2FACodeError()
			}

			const secret = await load2FASecret(user.id)

			if (!secret) throw new SecretNotFoundError()

			const isValid = authenticator.check(code, secret)

			if (!isValid) throw new Invalid2FACodeError()

			await mark2FAVerified(user.id)

			reply.send({ success: true });
		} catch (err) {
			throw err
		}
	})

	app.post('/2fa/backup-codes', {preHandler: [authenticate, checkCsrf]}, async (req, reply) => {
		const user = req.user as JwtUserPayload
		const codes = generateBackupCodes()
		const codesStr = JSON.stringify(codes)

		await setBackupCodes(codesStr, user.id)
		await markTwoFactorEnabled(user.id)
		reply.send({codes})
	})
}
