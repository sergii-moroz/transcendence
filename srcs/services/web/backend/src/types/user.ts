export interface User {
	id: number;
	username: string;
	password: string;
	bio: string;
	two_factor_enabled: boolean;
	two_factor_verified: boolean;
	two_factor_secret: string;
	two_factor_backup_codes: string;
}

export type JwtUserPayload = Pick<User, 'id' | 'username'>

interface PlayerStats {
	wins: number;
	matches: number;
	percentage: number;
}

interface TopPlayer extends PlayerStats {
	name: string;
}

export interface HomeResponse {
	stats: PlayerStats;
	topPlayer: TopPlayer;
}

export interface Friend {
	name: string;
	picture: string;
}

export interface FriendChat extends Friend {
	online: boolean;
	blocked: string | null;
}

export interface SidebarResponse {
	friends: {
		online: Friend[];
		offline: Friend[];
		// online: (Friend & { unreadMessages: boolean})[];
		// offline: (Friend & { unreadMessages: boolean})[];
	}
	FriendRequests: Friend[];
}

export interface Message {
	text: string;
	owner: string
}

export interface ChatInitResponse {
	messages: Message[];
	friend: FriendChat;
	gameInvite: boolean;
}
