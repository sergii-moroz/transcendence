import fastify, { FastifyServerOptions } from "fastify"
import fastifyStatic from "@fastify/static";
import fastifyCookie from "@fastify/cookie";
import { fileURLToPath } from "url";
import path from "path";

import { authRoutes } from "./routes/v1/auth.js";
import { routes } from "./routes/v1/routes.js"
import { initializeDB } from "./db/init.js";
import { db } from "./db/connections.js"

export const build = async (opts: FastifyServerOptions) => {
	const app = fastify(opts)

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
	app.register(authRoutes, {prefix: "api"})

	return app
}
