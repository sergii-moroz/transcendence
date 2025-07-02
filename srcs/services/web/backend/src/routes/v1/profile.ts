import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { newAvatarSchema, profileDataSchema, updateFunFactSchema } from "../../schemas/profile.schemas.js";
import { handleGetProfileData, handleNewAvatar, handleUpdateFunFact } from "../../controllers/profile.controller.js";
import { authenticate, checkCsrf } from "../../services/authService.js";

export const profile = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
	app.post('/profileData', {
		schema: profileDataSchema,
		preHandler:	[authenticate],
		handler: handleGetProfileData
	});

	app.post('/newAvatar', {
		schema: newAvatarSchema,
		preHandler:	[authenticate, checkCsrf],
		handler: handleNewAvatar
	});

	app.post('/updateFunFact', {
		schema: updateFunFactSchema,
		preHandler:	[authenticate, checkCsrf],
		handler: handleUpdateFunFact
	});
}