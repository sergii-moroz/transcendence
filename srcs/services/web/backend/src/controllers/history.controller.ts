import { FastifyReply, FastifyRequest } from "fastify";
import { JwtPayload } from "jsonwebtoken";
import { getUserPlayHistoryPingPongCount, getUserPlayHistoryPingPongPaginated } from "../services/history.services.js";
import { GAME_MODES } from "../services/socket.services.js";

export const handleGetHistoryPingPongAll = async (
	req:		FastifyRequest<{
		Querystring: {
			page?: string
			page_size?: string
		}
	}>,
	reply:	FastifyReply
) => {
	try {
		const user = req.user as JwtPayload
		const page = parseInt(req.query.page || '1')
		const pageSize = parseInt(req.query.page_size || '5')
		const games = await getUserPlayHistoryPingPongPaginated(user.id, GAME_MODES.MULTIPLAYER, page, pageSize)
		const total = await getUserPlayHistoryPingPongCount(user.id, GAME_MODES.MULTIPLAYER)
		const replyData = {
			data: games,
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
