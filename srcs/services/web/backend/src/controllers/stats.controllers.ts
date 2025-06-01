import { FastifyReply, FastifyRequest } from "fastify";
import { JwtUserPayload } from "../types/user.js";
import { getUserPerformance } from "../services/stats.services.js";

export const handleGetUserPerformance = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	try {
		const user = req.user as JwtUserPayload
		console.log("handleGetUserPerformance:", user)
		const stats = await getUserPerformance(user.id)
		reply.send(stats)
	} catch (err) {
		throw err
	}
}
