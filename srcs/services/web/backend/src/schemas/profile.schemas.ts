import { errorResponseSchema } from "./error-response-schema.js";

export const profileDataSchema = {
	body: {
		type: 'object',
		required: ['name'],
		properties: {
			name: { type: 'string' },
		},
	},
	response: {
		200: {
			type: 'object',
      		required: ['success', 'avatar', 'username', 'registerDate', 'funFact'],
			properties: {
				success: { type: 'boolean' },
				avatar: {type: 'string'},
				username: {type: 'string'},
				registerDate: {type: 'string'},
				funFact: {type: "string"}
			},
		},
		400: errorResponseSchema,
	},
}