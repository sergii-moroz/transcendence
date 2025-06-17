import {
	FastifyReply,
	FastifyRequest
} from "fastify"

import {
	findUserByUsername,
	verifyPassword
} from "../services/userService.js"

import {
	InvalidCredentialsError,
	UserNotFoundError
} from "../errors/login.errors.js"

import { JwtUserPayload } from "../types/user.js"
import { passwordResetService } from "../services/2fa.services.js"
import { ResetPasswordProps } from "../types/registration.js"
import { validatePasswordReset } from "../services/authService.js"
import bcrypt from 'bcrypt'


export const handlePasswordReset = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	try {
		const { currentPassword, password, repeated } = validatePasswordReset(req.body as ResetPasswordProps)
		const payload = req.user as JwtUserPayload
		const user = await findUserByUsername(payload.username)

		if (!user) throw new UserNotFoundError()

		const valid = await verifyPassword(currentPassword, user.password)

		if (!valid) throw new InvalidCredentialsError()

		if (user.two_factor_enabled) {
			return reply.code(202).send({ requires2FA: true })
		}

		// Normal password reset
		const hashed = await bcrypt.hash(password, 10);
		await passwordResetService(user.id, hashed)

		reply.send({ success: true })
	} catch (error) {
		throw error
	}
}
