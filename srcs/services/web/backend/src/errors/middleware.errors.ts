import createError from "@fastify/error";

export const AccessTokenExpiredError = createError(
	'FST_MIDDLEWARE_ACCESS_TOKEN_EXPIRED',
	'Access token expired',
	401
)

export const RefreshTokenExpiredError = createError(
	'FST_MIDDLEWARE_REFRESH_TOKEN_EXPIRED',
	'Refresh token expired',
	401
)

export const NoAccessTokenError = createError(
	'FST_MIDDLEWARE_NO_ACCESS_TOKEN',
	'No access token provided',
	401
)

export const NoRefreshTokenError = createError(
	'FST_MIDDLEWARE_NO_REFRESH_TOKEN',
	'No refresh token provided',
	401
)

export const NoCSRFTokenError = createError(
	'FST_MIDDLEWARE_NO_CSRF_TOKEN',
	'No CSRF token provided',
	403
)

export const AccessTokenInvalidError = createError(
	'FST_MIDDLEWARE_INVALID_ACCESS_TOKEN',
	'Invalid access token provided',
	401
)

export const RefreshTokenInvalidError = createError(
	'FST_MIDDLEWARE_REFRESH_TOKEN_INVALID',
	'Refresh token is invalid or expired',
	401
);

export const CsrfMismatchError = createError(
	'FST_MIDDLEWARE_CSRF_MISMATCH',
	'CSRF token mismatch',
	403
)
