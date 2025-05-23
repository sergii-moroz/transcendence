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
