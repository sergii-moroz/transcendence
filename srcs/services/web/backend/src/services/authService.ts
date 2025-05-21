import {
	UsernameTooLongError,
	UsernameTooShortError,
	UsernameWhitespaceError,
	PasswordTooLongError,
	PasswordTooShortError,
	PasswordWhitespaceError,
	PasswordMissingUppercaseError,
	PasswordMismatchError,
} from "../errors/registration.js";

import { FastifyReply, FastifyRequest } from "fastify";
import { verifyAccessToken } from "./tokenService.js";
import { RegisterInputProps } from "../types/registration.js";

export const validateRegisterInput = (input: RegisterInputProps): RegisterInputProps => {
	let { username, password, repeated } = input

	username.trim()
	password.trim()
	repeated.trim()

	if (username.length < 5) throw new UsernameTooShortError()
	if (username.length > 15) throw new UsernameTooLongError()
	if (/\s+/g.test(username)) throw new UsernameWhitespaceError()

	if (password.length < 6) throw new PasswordTooShortError();
	if (password.length > 64) throw new PasswordTooLongError();
	if (/\s+/g.test(password)) throw new PasswordWhitespaceError();
	if (!/[A-Z]/.test(password)) throw new PasswordMissingUppercaseError();

	if (password != repeated) throw new PasswordMismatchError()

	return { username, password, repeated }
}

export const checkCsrf = async (
	request:FastifyRequest,
	reply: FastifyReply,
) => {
	const csrfCookie = request.cookies.csrf_token;
	const csrfHeader = request.headers['x-csrf-token'];

	if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
		return reply.code(403).send({ error: 'CSRF token mismatch' });
	}
}

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
	const token = request.cookies.token;

	if (!token) {
		return reply.code(401).send({ error: 'Unauthorized: No token provided' });
	}

	try {
		request.user = verifyAccessToken(token);
	} catch (err) {
		return reply.code(401).send({ error: 'Invalid or expired token' });
	}
}
