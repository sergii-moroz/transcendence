import { errorResponseSchema } from "./error-response-schema.js";

export const registerSchema = {
	body: {
		type: 'object',
		required: ['username', 'password', 'repeated'],
		properties: {
			username: { type: 'string', minLength: 5, maxLength: 16 },
			password: { type: 'string', minLength: 6, maxLength: 64},
			repeated: { type: 'string', minLength: 6, maxLength: 64},
		}
	},
	response: {
		201: {
			type: 'object',
			properties: {
				message: { type: 'string' },
				userId: { type: 'number' },
			}
		},
		400: errorResponseSchema
	}
};

export const loginSchema = {
	body: {
		type: 'object',
		required: ['username', 'password'],
		properties: {
			username: { type: 'string' },
			password: { type: 'string' },
		}
	},
	response: {
		200: {
			type: 'object',
			properties: {
				accessToken: { type: 'string' },
				refreshToken: { type: 'string' },
				csrfToken: { type: 'string' },
			}
		},
		202: {
			type: 'object',
			properties: {
				requires2FA: { type: 'boolean' },
				token: { type: 'string' }
			}
		},
		401: {
			type: 'object',
			properties: {
				error: { type: 'string' }
			}
		}
	}
};
