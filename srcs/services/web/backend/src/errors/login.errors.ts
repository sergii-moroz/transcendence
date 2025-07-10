import createError from "@fastify/error";

export const UserNotFoundError = createError(
	'FST_USER_NOT_FOUND',
	'User not found',
	401
);

export const UserAlreadySignedIn = createError(
	'USER_ALREADY_SIGNED_IN',
	'User is already signed in',
	409
);

export const InvalidCredentialsError = createError(
	'FST_INVALID_CREDENTIALS',
	'Invalid username or password',
	401
);

export const InvalidUser = createError(
	'USER_ISNT_VALID',
	'You cant sign into this user',
	400
);


