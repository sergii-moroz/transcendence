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

export interface UserStats {
	id: number,
	wins: number,
	losses: number,
	t_wins: number,
	t_losses: number,
	ai_wins: number,
	ai_losses: number,
}

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

export interface SidebarResponse {
	friends: {
		online: (Friend & { unreadMessages: boolean})[];
		offline: (Friend & { unreadMessages: boolean})[];
	}
	FriendRequests: Friend[];
}

export interface Messages {
	text: string;
	timestamp: string;
	owner: string
}

export interface ChatInitResponse {
	messages: Messages[];
	friend: Friend & {onlineState: string};
	gameInvite: boolean;
}
