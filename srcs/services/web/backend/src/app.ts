import fastify, { FastifyReply, FastifyRequest, FastifyServerOptions } from "fastify"
import fastifyStatic from "@fastify/static";
import fastifyCookie from "@fastify/cookie";
import fastifyWebsocket from '@fastify/websocket';
import { fileURLToPath } from "url";
import path from "path";
import fs from 'fs';

import { authRoutes } from "./routes/v1/auth.js";
import { routes } from "./routes/v1/routes.js";
import { pages } from "./routes/v1/pages.js";
import { gameRoomSock } from "./routes/v1/gameRoom.js";
import { waitingRoomSock } from "./routes/v1/waitingRoom.js";
import { tWaitingRoomSock } from "./routes/v1/tWaitingRoom.js";
import { tournamentRoomSock } from "./routes/v1/tournamentRoom.js";
import { initializeDB } from "./db/init.js";
import { db } from "./db/connections.js"
import { Game } from "./services/game.js";
import { Tournament } from "./services/tournament.js";
import { verifyAccessToken } from "./services/tokenService.js";
import { twoFARoutes } from "./routes/v1/2fa.routes.js";
import { normalizeError } from "./errors/error.js";

export const build = async (opts: FastifyServerOptions) => {
	const app = fastify(opts)

	const gameInstances = new Map<string, Game>(); //gameID, Game Instance
	const tournaments = new Map<string, Tournament>(); //tournamentID, Tournament Instance

	app.decorate("gameInstances", gameInstances);
	app.decorate("tournaments", tournaments);
	app.decorate("db", db)

	app.register(fastifyCookie, {
		secret: 'cookiesecret-key-cookiesecret-key',
	});
	app.register(fastifyWebsocket);
	app.ready(async (err) => {

		console.custom('INFO', "SQLite plugin is loaded successfully.");
		initializeDB()
	})

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);

	app.addHook('preValidation', async (request: FastifyRequest, reply: FastifyReply) => {
		const requestURL = request.url;
		const publicRoutes = ['/api/login', '/api/register', '/api/2fa/verify-login'];
		if ((!requestURL.startsWith('/api/') && !requestURL.startsWith('/ws/')) || publicRoutes.includes(requestURL)) {
			console.custom('DEBUG', "No authentification required for this route");
			return;
		}
		console.custom('DEBUG', 'Authentifying user...');
		const token = request.cookies.token;
		if (!token) {
			return reply.code(401).send({ type: 'error', message: 'Unauthorized: No token provided' });
		}

		try {
			request.user = verifyAccessToken(token);
		} catch (err) {
			return reply.code(401).send({ type: 'error', message: 'Invalid or expired token' });
		}
	})

	app.setNotFoundHandler((request, reply) => {
		const requestURL = request.url;
		if (request.raw.method === 'GET' && (!requestURL.startsWith('/api/') && !requestURL.startsWith('/ws/'))) {
			return reply.type('text/html').send(fs.readFileSync(path.join(__dirname, 'public/index.html')));
		}
		reply.status(404).send({ error: 'Not found' });
	});

	app.register(fastifyStatic, {
		root: path.join(__dirname, 'public'),
		prefix: '/'
	})

	app.register(routes);
	app.register(pages, {prefix: "api"});
	app.register(waitingRoomSock, {prefix: "ws"});
	app.register(gameRoomSock, {prefix: "ws"});
	app.register(tWaitingRoomSock, {prefix: "ws"});
	app.register(tournamentRoomSock, {prefix: "ws"});
	app.register(authRoutes, {prefix: "api"});
	app.register(twoFARoutes, {prefix: 'api/2fa'});

	// GLOBAL ERROR HANDLING
	app.setErrorHandler( async (error, request, reply) => {
		const normalizedError = normalizeError(error);

		app.log.error(error);

		await reply
			.code(normalizedError.statusCode)
			.send(normalizedError);
	})

	return app
}
