import { FastifyReply, FastifyRequest } from "fastify";
import { JwtUserPayload } from "../types/user.js";

import {
	getMultiTopPlayers,
	getTournamentTopPlayers,
	getUserPerformance
} from "../services/stats.services.js";

export const handleGetUserPerformance = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	try {
		const user = req.user as JwtUserPayload
		const stats = await getUserPerformance(user.id)
		reply.send(stats)
	} catch (err) {
		throw err
	}
}

export const handleGetTopPlayers = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	try {
		const user = req.user as JwtUserPayload
		const m_topPlayers = await getMultiTopPlayers()
		const t_topPlayers = await getTournamentTopPlayers()
		reply.send({ "singleplayer": null, "multiplayer": m_topPlayers, "tournament": t_topPlayers })
	} catch (err) {
		throw err
	}
}
