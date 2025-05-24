import {
	FastifyInstance,
	FastifyPluginOptions
} from "fastify";

import {
	authenticate,
	checkCsrf
} from "../../services/authService.js";

import {
	gaRegisterSchema,
	generateBackupCodesSchema,
	is2FAEnabledSchema,
	loginVerify2FASchema,
	set2FAEnabledSchema,
	verify2FASchema
} from "../../schemas/2fa.schemas.js";

import {
	handleGARegister,
	handleGAVerify,
	handleGenerateBackupCodes,
	handleIs2FAEnabled,
	handleLoginVerify2FA,
	handleSet2FAEnabled
} from "../../controllers/2fa.controllers.js";

export const twoFARoutes = async (app: FastifyInstance, opts: FastifyPluginOptions) => {

	app.post('/ga/register', {
		schema:			gaRegisterSchema,
		preHandler:	[authenticate, checkCsrf],
		handler:		handleGARegister
	})

	app.post('/ga/verify', {
		schema:			verify2FASchema,
		preHandler:	[authenticate, checkCsrf],
		handler:		handleGAVerify
	})

	app.post('/backup-codes', {
		schema:			generateBackupCodesSchema,
		preHandler:	[authenticate, checkCsrf],
		handler:		handleGenerateBackupCodes
	})

	app.get('/enabled', {
		schema:			is2FAEnabledSchema,
		preHandler:	[authenticate],
		handler:		handleIs2FAEnabled
	})

	app.post('/enabled', {
		schema: set2FAEnabledSchema,
		preHandler: [authenticate, checkCsrf],
		handler: handleSet2FAEnabled
	})

	app.post('/login/verify', {
		schema: loginVerify2FASchema,
		handler: handleLoginVerify2FA
	})

}
