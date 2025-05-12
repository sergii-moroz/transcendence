export const errorResponseSchema = {
	type: 'object',
	required: ['code', 'name', 'statusCode', 'message', 'success'],
	properties: {
		code: { type: 'string' },
		name: { type: 'string' },
		statusCode: { type: 'number' },
		message: { type: 'string' },
		success: { type: 'boolean' },
	},
};
