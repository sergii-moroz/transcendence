import fastify, { FastifyServerOptions } from "fastify"
import fastifyStatic from "@fastify/static";
import fastifyCookie from "@fastify/cookie";
import fastifyWebsocket, { WebSocket } from '@fastify/websocket';
import { fileURLToPath } from "url";
import path from "path";
import fs from 'fs';

import { authRoutes } from "./routes/v1/auth.js";
import { gameRoomSock } from "./routes/v1/gameRoom.js";
import { matchmakingSock } from "./routes/v1/matchmaking.js";
import { tournamentListSock } from "./routes/v1/tournamentList.js";
import { tournamentRoomSock } from "./routes/v1/tournamentRoom.js";
import { initializeDB } from "./db/init.js";
import { Game } from "./services/game.js";
import { Tournament } from "./services/tournament.js";
import { twoFARoutes } from "./routes/v1/2fa.routes.js";
import { normalizeError } from "./errors/error.js";
import { friends } from "./routes/v1/friends.js";
import { chat } from "./routes/v1/chat.js";
import { statsRoutes } from "./routes/v1/stats.routes.js";
import { historyRoutes } from "./routes/v1/game-history.route.js";
import { singlePlayerRoutes } from "./routes/v1/singleplayer.route.js";

import { profile } from "./routes/v1/profile.js";
import fastifyMultipart from "@fastify/multipart";

interface CustomFastifyOptions extends FastifyServerOptions {
	https?: {
		key: Buffer,
		cert: Buffer,
		allowHTTP1?: boolean
	}
}

export const build = async (opts: CustomFastifyOptions) => {
	const app = fastify(opts)

	const gameInstances = new Map<string, Game>(); //gameID, Game Instance
	const tournaments = new Map<string, Tournament>(); //tournamentID, Tournament Instance

	app.decorate("gameInstances", gameInstances);
	app.decorate("tournaments", tournaments);
	app.decorate("onlineUsers", new Map<string, WebSocket>());


	app.register(fastifyCookie, {
		secret: 'cookiesecret-key-cookiesecret-key',
	});
	app.register(fastifyWebsocket);
	app.ready(async (err) => {

		console.custom('INFO', "SQLite plugin is loaded successfully.");
		initializeDB()
	})

	app.register(fastifyMultipart, {
		limits: {
			files: 1,
			fileSize: 5 * 1024 * 1024,
		}
	});

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);

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

	app.register(friends, {prefix: "api"});
	app.register(profile, {prefix: "api"});
	app.register(chat);
	app.register(matchmakingSock, {prefix: "ws"});
	app.register(gameRoomSock, {prefix: "ws"});
	app.register(tournamentListSock, {prefix: "ws"});
	app.register(tournamentRoomSock, {prefix: "ws"});
	app.register(authRoutes, {prefix: "api"});
	app.register(twoFARoutes, {prefix: 'api/2fa'});
	app.register(statsRoutes, {prefix: 'api/stats'});
	app.register(historyRoutes, {prefix: 'api/history'});
	app.register(singlePlayerRoutes, {prefix: 'api/singleplayer'});

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
