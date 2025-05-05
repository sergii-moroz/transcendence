export interface User {
	username: string;
	bio: string;
}

export interface eventListenerObject {
	element: HTMLElement | Window;
	type: string;
	handler: (e: Event) => void;
}

export interface WsMatchMakingMessage {
	type: string;
	message?: string;
	gameRoomId?: string;
}