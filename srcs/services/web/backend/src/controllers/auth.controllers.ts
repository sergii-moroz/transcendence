import { FastifyReply, FastifyRequest } from "fastify";

export const handleLogout = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	reply
		.clearCookie('token', { path: '/' })
		.clearCookie('refreshToken', { path: '/' })
		.clearCookie('csrf_token', { path: '/' })
		.send({ success: true });
}
