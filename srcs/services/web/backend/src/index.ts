import { FastifyServerOptions } from "fastify";
import "./services/utils.js";
import { build } from "./app.js";

const opts: FastifyServerOptions = { logger: true }

if (process.stdout.isTTY) {
	opts.logger = {
		transport: {
			target: 'pino-pretty'
		}
	}
}

const app = await build(opts)
const port: number = Number(process.env.PORT) || 4242
const host: string = process.env.HOST || '127.0.0.1'

const start = async () => {
	try {
		await app.listen({ port, host })
	} catch(err) {
		app.log.error(err)
		process.exit(1)
	}
}

start()
