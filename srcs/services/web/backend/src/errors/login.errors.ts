import createError from "@fastify/error";

export const UserNotFoundError = createError(
	'FST_USER_NOT_FOUND',
	'User not found',
	401
);

export const InvalidCredentialsError = createError(
	'FST_INVALID_CREDENTIALS',
	'Invalid username or password',
	401
);

