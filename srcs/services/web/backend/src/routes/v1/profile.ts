import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { newAvatarSchema, profileDataSchema } from "../../schemas/profile.schemas.js";
import { handleGetProfileData, handleNewAvatar } from "../../controllers/profile.controller.js";

export const profile = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
	app.post('/profileData', {
		schema: profileDataSchema,
		handler: handleGetProfileData
	});

	app.post('/newAvatar', {
		schema: newAvatarSchema,
		handler: handleNewAvatar
	});
}