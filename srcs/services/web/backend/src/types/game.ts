import { FastifyRequest } from "fastify";

export type GameRoomRequest = FastifyRequest<{Params: { gameRoomId: string}}>;