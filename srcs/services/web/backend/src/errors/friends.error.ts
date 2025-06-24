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

export const MessageInvalid = createError(
	'INVALID_MESSAGE',
	'message has wrong format',
	400
);

export const FileInvalid = createError(
	'INVALID_FILE',
	'file cant be uploaded. File is not valid',
	400
);

export const FileTypeInvalid = createError(
	'INVALID_FILE_TYPE',
	'file cant be uploaded. FileType is not valid',
	400
);



