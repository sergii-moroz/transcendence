import createError from "@fastify/error";

export const UsernameTooShortError = createError(
	'FST_USERNAME_TOO_SHORT',
	'Username must be at least 5 characters long',
	400
);

export const UsernameTooLongError = createError(
	'FST_USERNAME_TOO_LONG',
	'Username must not exceed 15 characters',
	400
);

export const UsernameWhitespaceError = createError(
	'FST_USERNAME_WHITESPACE',
	'Username must not contain whitespace',
	400
);

export const PasswordTooShortError = createError(
	'FST_PASSWORD_TOO_SHORT',
	'Password must be at least 6 characters long',
	400
);

export const PasswordTooLongError = createError(
	'FST_PASSWORD_TOO_LONG',
	'Password must not exceed 64 characters',
	400
);

export const PasswordWhitespaceError = createError(
	'FST_PASSWORD_WHITESPACE',
	'Password must not contain whitespace',
	400
);

export const PasswordMissingUppercaseError = createError(
	'FST_PASSWORD_NO_UPPERCASE',
	'Password must include at least one uppercase letter',
	400
);

export const PasswordMismatchError = createError(
	'FST_PASSWORD_MISMATCH',
	'Passwords do not match',
	400
);
