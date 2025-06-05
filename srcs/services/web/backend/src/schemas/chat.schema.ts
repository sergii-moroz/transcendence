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
      required: ['friend', 'messages', 'gameInvite'],
			properties: {
				friend: friendTypeSchema,
        messages: { type: 'array', items: messageTypeSchema },
        gmaeInvite: {
          type: 'boolean',
        }
			},
		},
		400: errorResponseSchema,
	},
}