import { Matchup, PlayerInfo } from './types/tournament.js';

export interface User {
	username: string;
	bio: string;
}

export interface eventListenerObject {
	element: HTMLElement | Window | Document;
	type: string;
	handler: (e: Event) => void;
}

export interface WsMatchMakingMessage {
	type: string;
	message?: string;
	gameRoomId?: string;
	tournamentId?: string;
	opponentId?: string;
	opponentName?: string;
	matchups?: Matchup[];
	maxPlayers?: number;
}

export interface GameState {
	ball: { x: number; y: number; dx: number; dy: number };
	paddles: {
		player1: { y: number };
		player2: { y: number };
	};
	scores: {
		player1: number;
		player2: number;
		user1: string;
		user2: string;
	};
};

export interface gameJson {
	type: string;
	state: GameState;
	message?: string;
	winner?: string;
	tournamentId?: string | null;
}

export interface tournamentListJson {
	type: string;
	message?: string;
	tournamentId?: string;
	tournaments?: {
		id: string;
		playerCount: number;
		maxPlayers: number;
		isRunning: boolean;
	}[];
}
