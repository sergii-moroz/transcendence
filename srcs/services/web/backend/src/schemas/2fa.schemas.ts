import { errorResponseSchema } from "./error-response-schema.js";

export const gaRegisterSchema = {
	body: {
		type: 'object',
		additionalProperties: false,
		properties: {}
	},
	response: {
		200: {
			type: 'object',
			required: ['qr', 'secret'],
			properties: {
				qr: { type: 'string' },
				secret: { type: 'string' }
			}
		},
		401: errorResponseSchema, // optional: if auth fails
		500: errorResponseSchema,
	}
};

export const verify2FASchema = {
	body: {
		type: 'object',
		required: ['code'],
		properties: {
			code: { type: 'string', minLength: 6, maxLength: 6 },
		},
	},
	response: {
		200: {
			type: 'object',
			properties: {
				success: { type: 'boolean' },
			},
		},
		400: errorResponseSchema,
		401: errorResponseSchema,
		403: errorResponseSchema,
		404: errorResponseSchema,
		500: errorResponseSchema,
	},
};

export const generateBackupCodesSchema = {
	description: 'Generate new backup codes for 2FA',
	tags: ['2fa'],
	response: {
		200: {
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				codes: {
					type: 'array',
					items: { type: 'string'},
				}
			}
		},
		404: errorResponseSchema, // FST_USER_NOT_FOUND
		409: errorResponseSchema, // FST_2FA_ALREADY_ENABLED
		500: errorResponseSchema, // FST_HASHING_ERROR
	}
}

export const set2FAEnabledSchema = {
	description: 'Enable 2FA for the authenticated user',
	tags: ['2FA'],
	response: {
		200: {
			type: 'object',
			properties: {
				success: { type: 'boolean' }
			},
			required: ['success']
		},
		404: errorResponseSchema, // FST_USER_NOT_FOUND
		409: errorResponseSchema, // FST_2FA_ALREADY_ENABLED
	}
}
