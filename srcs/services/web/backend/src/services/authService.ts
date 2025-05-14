import { FastifyReply, FastifyRequest } from "fastify";
import { verifyAccessToken } from "./tokenService.js";

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
