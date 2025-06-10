import { errorResponseSchema } from "./error-response-schema.js";

const friendTypeSchema = {
  type: 'object',
  required: ['name', 'picture'],
  properties: {
    name: { type: 'string' },
    picture: { type: 'string' },
  },
};

export const friendListSbSchema = {
  response: {
    200: {
      type: 'object',
      required: ['friends', 'friendRequests', 'success'],
      properties: {
        friends: {
          type: 'object',
          required: ['online', 'offline'],
          properties: {
            online: { type: 'array', items: friendTypeSchema },
            offline: { type: 'array', items: friendTypeSchema },
          },
        },
        friendRequests: { type: 'array', items: friendTypeSchema },
        success: {type: 'boolean' }
      },
    },
    400: errorResponseSchema,
  },
};

export const friendSchema = {
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