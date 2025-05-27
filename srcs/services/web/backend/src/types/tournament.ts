import { FastifyRequest } from "fastify";

export type TournamentRoomRequest = FastifyRequest<{Params: { tournamentId: string}}>;