import {
	FastifyInstance,
	FastifyPluginOptions,
} from "fastify"

export const routes = async (app: FastifyInstance, opts: FastifyPluginOptions) => {

	// app.get('/', async (request, reply) => {
	// 	return { hello: 'world' }
	// })

	app.get('/login', async (request, reply) => {
		return { login: 'page'}
	})

}
