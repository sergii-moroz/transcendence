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

export type SinglePlayerStats = Pick<UserStats, 's_wins' | 's_losses'> & { username: string }
export type MultiPlayerStats = Pick<UserStats, 'm_wins' | 'm_losses'> & { username: string }
export type TournamentStats = Pick<UserStats, 't_wins' | 't_losses'> & { username: string }

export type TopPlayers = {
	singleplayer: SinglePlayerStats[] | null;
	multiplayer: MultiPlayerStats[] | null;
	tournament: TournamentStats[] | null;
}

// interface PlayerStats {
// 	wins: number;
// 	matches: number;
// 	percentage: number;
// }

// interface TopPlayer extends PlayerStats {
// 	name: string;
// }

// export interface HomeResponse {
// 	stats: PlayerStats;
// 	topPlayer: TopPlayer;
// }

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
