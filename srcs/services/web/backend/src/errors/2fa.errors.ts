import createError from '@fastify/error'

export const Invalid2FACodeError = createError(
	'FST_2FA_INVALID_CODE',
	'Invalid 2FA code',
	401
);

export const Missing2FACodeError = createError(
	'FST_2FA_CODE_REQUIRED',
	'2FA code is required',
	400
);

export const SecretNotFoundError = createError(
	'FST_2FA_SECRET_NOT_FOUND',
	'2FA secret not found',
	404
);

export const TwoFAAlreadyEnabledError = createError(
	'FST_2FA_ALREADY_ENABLED',
	'Two-Factor Authentication is already enabled',
	409
);

export const HashingError = createError(
	'FST_HASHING_ERROR',
	'Failed to hash code(s)',
	500
);

export const UserNotFoundError = createError(
	'FST_USER_NOT_FOUND',
	'User not found',
	404
);
