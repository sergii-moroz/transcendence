import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { profileDataSchema } from "../../schemas/profile.schemas.js";
import { handleGetProfileData } from "../../controllers/profile.controller.js";

export const profile = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
	app.post('/profileData', {
		schema: profileDataSchema,
		handler: handleGetProfileData
	});
}