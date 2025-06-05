import createError from "@fastify/error";

export const FriendInvalid = createError(
	'FRIEND_INVALID',
	'The user "%s" is not a valid friend',
	400
);

export const FriendshipInvalid = createError(
	'FRIENSHIP_INVALID',
	'Friendship is invalid',
	400
)

export const FriendInvalidCustom = createError(
	'FRIEND_INVALID',
	'%s',
	400
);

export const AdminError = createError(
	'CANT_DO_THIS_WITH_ADMIN',
	'You cant perform this action on admin user',
	400
);



