import {
	disable2FAService,
	generate2FASecretAndQRCode,
	generateBackupCodesService,
	getPasswordResetIntent,
	is2FAEnabled,
	loginVerify2FAService,
	mark2FAEnabled,
	passwordResetService,
	verifyGACode
} from "../services/2fa.services.js";

import {
	createCsrfToken,
	generateAccessToken,
	generateRefreshToken
} from "../services/tokenService.js";

import {
	FastifyReply,
	FastifyRequest
} from "fastify";

import {
	NoAccessTokenError,
	NoTemporaryTokenError
} from "../errors/middleware.errors.js";

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

export const handleIs2FAEnabled = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	const user = req.user as JwtUserPayload;
	const enabled = await is2FAEnabled(user.id)
	reply.send({ enabled, success: true })
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

export const handleLoginVerify2FA = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	const { token, code } = req.body as { token: string, code: string }

	if (!token) throw new NoAccessTokenError()

	try {
		const user = await loginVerify2FAService(token, code)
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
}

export const handleDisable2FA = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	try {
		const user = req.user as JwtUserPayload
		const { code } = req.body as { code: string };

		await disable2FAService(user.id, code)
		reply.send({ success: true })
	} catch (err) {
		throw err
	}
}

export const handleResetVerify2FA = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	const { token, code } = req.body as { token: string, code: string }

	if (!token) throw new NoTemporaryTokenError()

	try {
		const user = await loginVerify2FAService(token, code) // TODO: Rename
		const intent = await getPasswordResetIntent(token)
		await passwordResetService(intent.user_id, intent.hashed_password)

		return reply.send({ success: true })
	} catch (err) {
		throw err
	}
}
