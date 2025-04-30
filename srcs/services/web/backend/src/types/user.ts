export interface User {
	id: number;
	username: string;
	password: string;
	bio: string;
}

export type JwtUserPayload = Pick<User, 'id' | 'username'>
