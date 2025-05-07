import 'fastify';
import { JwtUserPayload } from '../src/types/user.js';

declare module 'fastify' {
	interface FastifyInstance {

		gameInstances: Map<string, Game>; //gameID, Game Instance
		waitingRoomConns: Map<string, WebSocket>; //username, Connection
		authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
	}

	interface FastifyRequest {
		user: JwtUserPayload;
	}
}
