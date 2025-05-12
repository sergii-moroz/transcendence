import { errorResponseSchema } from "./error-response-schema.js";

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
