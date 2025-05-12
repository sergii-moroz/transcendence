import { ErrorResponse } from "../types/errors.js";

// Standardize unknown errors
export const normalizeError = (error: unknown): ErrorResponse => {
	if (error instanceof Error && 'statusCode' in error) {
		return {
			success: false,
			code: (error as any).code || 'UNKNOWN_ERROR',
			name: error.name,
			statusCode: (error as any).statusCode || 500,
			message: error.message,
		};
	}

	return {
		success: false,
		code: 'INTERNAL_SERVER_ERROR',
		name: 'InternalServerError',
		statusCode: 500,
		message: 'Internal server error',
	};
};
