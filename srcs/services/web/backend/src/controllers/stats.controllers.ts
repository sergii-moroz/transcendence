import { FastifyReply, FastifyRequest } from "fastify";
import { JwtUserPayload } from "../types/user.js";

import {
	getTopPlayers,
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
	req:		FastifyRequest<{
		Querystring: {
			limit?: string
		}
	}>,
	reply:	FastifyReply
) => {
	const limit = parseInt(req.query.limit || '3')
	try {
		const s_topPlayers = await getTopPlayers('singleplayer', limit)
		const m_topPlayers = await getTopPlayers('multiplayer', limit)
		const t_topPlayers = await getTopPlayers('tournament', limit)
		reply.send({ singleplayer: s_topPlayers, multiplayer: m_topPlayers, tournament: t_topPlayers })
	} catch (err) {
		throw err
	}
}
