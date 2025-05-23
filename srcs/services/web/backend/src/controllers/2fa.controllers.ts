import { FastifyReply, FastifyRequest } from "fastify";
import { generate2FASecretAndQRCode } from "../services/2fa.services.js";
import { JwtUserPayload } from "../types/user.js";

export const handleGARegister = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	try {
		const user = req.user as JwtUserPayload;
		const { qr, secret } = await generate2FASecretAndQRCode(user)
		reply.send({ qr, secret });
	} catch (err) {
		throw err
	}
}
