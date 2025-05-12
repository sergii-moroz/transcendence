import {
	FastifyInstance,
	FastifyPluginOptions
} from "fastify";

import {
	authenticate,
	checkCsrf
} from "../../services/authService.js";

import { updateTwoFASecret } from "../../services/2faService.js";
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

			await updateTwoFASecret(user.username, secret)

			reply.send({ qr, secret });
		} catch (err) {
			reply.code(500).send({ error: 'Failed to register 2FA' });
		}
	});
}
