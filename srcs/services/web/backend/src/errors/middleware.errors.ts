import createError from "@fastify/error";

export const AccessTokenExpiredError = createError(
	'FST_MIDDLEWARE_ACCESS_TOKEN_EXPIRED',
	'Access token expired',
	401
)

export const NoAccessTokenError = createError(
	'FST_MIDDLEWARE_NO_ACCESS_TOKEN',
	'No access token provided',
	401
)

export const InvalidAccessTokenError = createError(
	'FST_MIDDLEWARE_INVALID_ACCESS_TOKEN',
	'Invalid access token provided',
	401
)

export const CsrfMissingError = createError(
	'FST_MIDDLEWARE_NO_CSRF_TOKEN',
	'No CSRF token provided',
	403
)

export const CsrfMismatchError = createError(
	'FST_MIDDLEWARE_CSRF_MISMATCH',
	'CSRF token mismatch',
	403
)
