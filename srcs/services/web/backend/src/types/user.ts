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
	m_wins: number,
	m_losses: number,
	t_wins: number,
	t_losses: number,
	s_wins: number,
	s_losses: number,
}

export type GameMode = 'singleplayer' | 'multiplayer' | 'tournament'

export interface PlayerStats {
	username: string,
	wins: number,
	losses: number,
	win_rate: number,
}

export type TopPlayers = {
	singleplayer: PlayerStats[] | null;
	multiplayer: PlayerStats[] | null;
	tournament: PlayerStats[] | null;
}

export interface Friend {
	name: string;
	picture: string;
}

export interface FriendInChat extends Friend {
	online: boolean;
	blocked: string | null;
	game_invite_from: number | null;
}

export interface SidebarResponse {
	friends: {
		online: Friend[];
		offline: Friend[];
	}
	friendRequests: Friend[];
}

export interface Message {
	text: string;
	owner: string
}

export interface MessageToServer {
	text: string;
	to: string
}


export interface ChatInitResponse {
	messages: Message[] | undefined;
	friend: FriendInChat;
	gameInvite: boolean;
}
