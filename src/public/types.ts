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
}

export interface GameState {
	ball: { x: number; y: number };
	paddles: {
		player1: { y: number };
		player2: { y: number };
	};
	scores: {
		player1: number;
		player2: number;
	};
};

export interface gameJson {
	type: string;
	state: GameState;
	message?: string;
}