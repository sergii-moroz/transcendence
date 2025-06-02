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
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	try {
		const s_topPlayers = await getTopPlayers('singleplayer')
		const m_topPlayers = await getTopPlayers('multiplayer')
		const t_topPlayers = await getTopPlayers('tournament')
		reply.send({ singleplayer: s_topPlayers, multiplayer: m_topPlayers, tournament: t_topPlayers })
	} catch (err) {
		throw err
	}
}
