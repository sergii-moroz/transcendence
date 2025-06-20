import { FastifyReply, FastifyRequest } from "fastify";
import { JwtUserPayload } from "../types/user.js";

import {
	getTopPlayers,
	getUserPerformance
} from "../services/stats.services.js";
import { findUserByUsername } from "../services/userService.js";
import { UserNotFoundError } from "../errors/login.errors.js";

export const handleGetUserPerformance = async (
	req:		FastifyRequest<{
		Querystring: {
			username?: string
		}
	}>,
	reply:	FastifyReply
) => {
	try {
		const username = req.query.username || null
		const user = username ? await findUserByUsername(username) : req.user as JwtUserPayload

		if (!user) throw UserNotFoundError()

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
