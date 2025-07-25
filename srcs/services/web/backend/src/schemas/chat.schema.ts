import { errorResponseSchema } from "./error-response-schema.js";

const friendTypeSchema = {
  type: 'object',
  required: ['name', 'picture', 'online', 'blocked'],
  properties: {
    name: { type: 'string' },
    picture: { type: 'string' },
    online: { type: 'boolean' },
    blocked: { type: ['string', 'null'] },
  },
};

const messageTypeSchema = {
  type: 'object',
  required: ['text', 'owner'],
  properties: {
    text: { type: 'string' },
    owner: { type: 'string' },
  },
};

export const chatInitSchema = {
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
      required: ['friend', 'messages', 'gameInvite', 'success'],
			properties: {
				friend: friendTypeSchema,
        messages: { type: 'array', items: messageTypeSchema },
        gameInvite: {
          type: 'boolean',
        },
        success: { type: 'boolean' },
			},
		},
		400: errorResponseSchema,
	},
}

export const gameInviteSchema = {
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
      required: ['success'],
			properties: {
        success: { type: 'boolean' },
			},
		},
		400: errorResponseSchema,
	},
}

export const acceptGameInviteSchema = {
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
      required: ['success', 'gameID'],
			properties: {
				success: { type: 'boolean' },
				gameID: { type: 'string' }
			},
		},
		400: errorResponseSchema,
	},
}