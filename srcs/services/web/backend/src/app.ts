import fastify, { FastifyServerOptions } from "fastify"
import fastifyStatic from "@fastify/static";
import fastifyCookie from "@fastify/cookie";
import { fileURLToPath } from "url";
import path from "path";

import { authRoutes } from "./routes/v1/auth.js";
import { routes } from "./routes/v1/routes.js"
import { gameRoomSock } from "./routes/v1/gameRoom.js";
import { waitingRoomSock } from "./routes/v1/waitingRoom.js";
import { initializeDB } from "./db/init.js";
import { db } from "./db/connections.js"
import { Game } from "./services/game.js";

export const build = async (opts: FastifyServerOptions) => {
	const app = fastify(opts)

	const gameInstances = new Map<string, Game>(); //gameID, Game Instance
	let waitingRoomConns = new Map<string, WebSocket>(); //username, Connection

	app.decorate("gameInstances", gameInstances);
	app.decorate("waitingRoomConns", waitingRoomConns);
	app.decorate("db", db)

	app.register(fastifyCookie, {
		secret: 'cookiesecret-key-cookiesecret-key',
	});

	app.ready(async (err) => {

		console.log("SQLite plugin is loaded successfully.");
		initializeDB()
	})

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);

	app.register(fastifyStatic, {
		root: path.join(__dirname, 'public'),
		prefix: '/'
	})

	app.register(routes)
	app.register(waitingRoomSock, {prefix: "ws"})
	app.register(gameRoomSock, {prefix: "ws"})
	app.register(authRoutes, {prefix: "api"})

	return app
}
