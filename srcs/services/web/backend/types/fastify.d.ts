import 'fastify';
import { JwtUserPayload } from '../src/types/user.js';

declare module 'fastify' {
	interface FastifyInstance {

		gameInstances: Map<string, Game>; //gameID, Game Instance
		tournaments: Map<string, Tournament>; //tournamentID, Tournament Instance
		authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
	}

	interface FastifyRequest {
		user: JwtUserPayload;
	}
}
