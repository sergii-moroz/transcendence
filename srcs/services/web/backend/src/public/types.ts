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