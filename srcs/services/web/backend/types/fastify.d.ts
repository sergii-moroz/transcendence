import 'fastify';
import { JwtUserPayload } from '../src/types/user.js';
import { WebSocket } from '@fastify/websocket';

declare module 'fastify' {
	interface FastifyInstance {

		gameInstances: Map<string, Game>; //gameID, Game Instance
		tournaments: Map<string, Tournament>; //tournamentID, Tournament Instance
		onlineUsers: Map<string, WebSocket>;
		authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
	}

	interface FastifyRequest {
		user: JwtUserPayload;
	}
}
