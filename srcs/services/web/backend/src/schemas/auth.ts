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
				success: { type: 'boolean'}
			},
			required: ['success'],
			additionalProperties: false
		},
		202: {
			type: 'object',
			properties: {
				requires2FA: { type: 'boolean' },
				token: { type: 'string' }
			},
			required: ['requires2FA', 'token'],
			additionalProperties: false
		},
		401: errorResponseSchema,
	}
}

export const logoutSchema = {
	description: 'Clears authentication and CSRF cookies to log the user out.',
	tags: ['auth'],
	response: {
		200: {
			type: 'object',
			properties: {
				success: { type: 'boolean' }
			}
		}
	}
}
