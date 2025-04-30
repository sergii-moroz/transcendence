import 'fastify';
import { JwtUserPayload } from '../src/types/user.ts';

declare module 'fastify' {
	interface FastifyInstance {
		authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
	}

	interface FastifyRequest {
		user: JwtUserPayload;
	}
}
