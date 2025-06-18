import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { newAvatarSchema, profileDataSchema, updateFunFactSchema } from "../../schemas/profile.schemas.js";
import { handleGetProfileData, handleNewAvatar, handleUpdateFunFact } from "../../controllers/profile.controller.js";

export const profile = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
	app.post('/profileData', {
		schema: profileDataSchema,
		handler: handleGetProfileData
	});

	app.post('/newAvatar', {
		schema: newAvatarSchema,
		handler: handleNewAvatar
	});

	app.post('/updateFunFact', {
		schema: updateFunFactSchema,
		handler: handleUpdateFunFact
	});
}