import { FastifyServerOptions } from "fastify";
import "./services/utils.js";
import { build } from "./app.js";
import metricsPlugin from './plugins/metrics.js';
import { fileURLToPath } from "url";
import path from "path"
import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface CustomFastifyOptions extends FastifyServerOptions {
	https?: {
		key: Buffer,
		cert: Buffer,
		allowHTTP1?: boolean
	}
}

const httpsOptions = {
	key: fs.readFileSync(path.join(__dirname, 'ssl/server.key')),
	cert: fs.readFileSync(path.join(__dirname, 'ssl/server.crt')),
	allowHTTP1: true
}

const opts: CustomFastifyOptions = { logger: true, https: httpsOptions }

if (process.stdout.isTTY) {
	opts.logger = {
		transport: {
			target: 'pino-pretty'
		}
	}
}

const app = await build(opts)

await app.register(metricsPlugin)
const port: number = Number(process.env.PORT) || 443
const host: string = process.env.HOST || '0.0.0.0'

const start = async () => {
	try {
		await app.listen({ port, host })
	} catch(err) {
		app.log.error(err)
		process.exit(1)
	}
}

start()
