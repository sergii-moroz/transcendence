import {
	generate2FASecretAndQRCode,
	generateBackupCodesService,
	is2FAEnabled,
	mark2FAEnabled,
	verifyGACode
} from "../services/2fa.services.js";

import { FastifyReply, FastifyRequest } from "fastify";
import { JwtUserPayload } from "../types/user.js";
import { TwoFAAlreadyEnabledError } from "../errors/2fa.errors.js";

export const handleGARegister = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	try {
		const user = req.user as JwtUserPayload
		const { qr, secret } = await generate2FASecretAndQRCode(user)
		reply.send({ qr, secret });
	} catch (err) {
		throw err
	}
}

export const handleGAVerify = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	try {
		const user = req.user as JwtUserPayload
		const { code } = req.body as { code?: string };
		await verifyGACode(user.id, code)
		reply.send({ success: true })
	} catch (err) {
		throw err
	}
}

export const handleGenerateBackupCodes = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	try {
		const user = req.user as JwtUserPayload

		// Check if 2FA is already enabled
		const isEnabled = await is2FAEnabled(user.id)
		if (isEnabled) throw new TwoFAAlreadyEnabledError()

		const result = await generateBackupCodesService(user.id)
		reply.send({codes: result, success: true})
	} catch (err) {
		throw err
	}
}

export const handleSet2FAEnabled = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	try {
		const user = req.user as JwtUserPayload

		// check if 2FA is already enabled
		const isEnabled = await is2FAEnabled(user.id)
		if (isEnabled) throw new TwoFAAlreadyEnabledError()

		await mark2FAEnabled(user.id)
		reply.send({ success: true })
	} catch (err) {
		throw err
	}
}
