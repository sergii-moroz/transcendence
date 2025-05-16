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

// interface Friends {
// 	amountTotal: number;
// 	online: {
// 		amount: number;
// 	}
// 	offline: {
// 		amount: number;
// 	}
// }

export interface HomeResponse {
	stats: PlayerStats;
	topPlayer: TopPlayer;
	friendAmount: number;
}
