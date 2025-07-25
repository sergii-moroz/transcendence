import { WsMatchMakingMessage } from "../types.js";
import { Router } from "../router-static.js"
import { API } from "../api-static.js";

export class Matchmaking extends HTMLElement {
	socket: WebSocket | null = null;
	// reconnectAttemped = false

	constructor() {
		super();
	}

	connectedCallback() {
		this.render();
		this.handleSocket();
	}

	disconnectedCallback() {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.close();
			console.log('MatchMaking: Disconnecting from socket, page unload...');
		}
	}

	handleSocket = async () => {
		const res = await API.ping();
		if (!res.success) return;
		this.socket = new WebSocket(`wss://${window.location.hostname}:${window.location.port}/ws/matchmaking`);

		this.socket.onopen = this.handleOpen;
		this.socket.onmessage = this.handleMessage;
		this.socket.onclose = this.handleClose;
		this.socket.onerror = this.handleError;
	}

	handleOpen = () => {
		console.log('MatchMaking: WebSocket connection established.');
	}

	handleMessage = (event: MessageEvent) => {
		const data = JSON.parse(event.data) as WsMatchMakingMessage;


		if (data.type === 'redirectingToGame') {
			console.log(`Redirecting to game room: ${data.gameRoomId}`);
			Router.navigateTo('/game/' + data.gameRoomId);
		}
	}

	handleClose = () => {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.close();
			console.log('MatchMaking: Disconnecting from socket, page unload...');
		}
		else
			console.log('MatchMaking: WebSocket connection closed.');
	}

	handleError = async (err: Event) => {
		console.error('Matchmaking: WebSocket error:', err);
		// if (!this.reconnectAttemped) {
		// 	this.reconnectAttemped = true

		// 	try {
		// 		console.log("Attempting to refresh token...")
		// 		await API.refreshToken()
		// 		this.handleSocket()
		// 	} catch (error) {
		// 		console.error("Token refresh failed:", error)
		// 	}
		// } else {
		// 	console.error("WebSocket failed even after token refresh")
		// }
	}

	// <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
	// 	Waiting for other players to join
	// </h2>
	// <div class="flex justify-center space-x-1 mt-2">
	// 	<div class="h-2 w-2 bg-gray-600 dark:bg-gray-300 rounded-full animate-bounce [animation-delay:0ms]"></div>
	// 	<div class="h-2 w-2 bg-gray-600 dark:bg-gray-300 rounded-full animate-bounce [animation-delay:150ms]"></div>
	// 	<div class="h-2 w-2 bg-gray-600 dark:bg-gray-300 rounded-full animate-bounce [animation-delay:300ms]"></div>
	// </div>
	render() {
		this.innerHTML = `
			<div class="tw-card px-6 py-11 w-full max-w-md text-center">
				<div class="flex flex-row items-center justify-center gap-3">
					<div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black-400 dark:border-white-400"></div>
					<p id="waiting-message" class="text-sm text-black-400 dark:text-white-400 text-center m-0">Waiting for other players...</p>
				</div>
			</div>
		`;
	}
}
