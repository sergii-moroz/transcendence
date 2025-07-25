import { FastifyReply, FastifyRequest } from "fastify";
import { JwtPayload } from "jsonwebtoken";
import { getUserPlayHistoryPingPongCount, getUserPlayHistoryPingPongPaginated } from "../services/history.services.js";
import { GAME_MODES } from "../public/types/game-history.types.js";
import { findUserByUsername } from "../services/userService.js";
import { UserNotFoundError } from "../errors/login.errors.js";

export const handleGetHistoryPingPong = async (
	req:		FastifyRequest<{
		Querystring: {
			page?: string
			page_size?: string
			game_mode?: GAME_MODES
			username?: string
		}
	}>,
	reply:	FastifyReply
) => {
	try {
		const username = req.query.username || null
		const user = username
			? await findUserByUsername(username)
			: req.user as JwtPayload

		if (!user) throw UserNotFoundError()

		const page = parseInt(req.query.page || '1')
		const pageSize = parseInt(req.query.page_size || '5')
		const gameMode = req.query.game_mode || GAME_MODES.Singleplayer
		const games = await getUserPlayHistoryPingPongPaginated(user.id, gameMode, page, pageSize)
		const total = await getUserPlayHistoryPingPongCount(user.id, gameMode)
		const replyData = {
			data: games,
			mode: gameMode,
			meta: {
				total,
				page,
				pageSize,
				totalPages: Math.ceil(total / pageSize)
			}
		}
		// console.log("Paginated DATA:", replyData )
		reply.send(replyData)
	} catch (err) {
		throw err
	}
}
