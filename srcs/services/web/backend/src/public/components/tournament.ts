import { Router } from "../router-static.js";
import { WsMatchMakingMessage } from "../types.js";

export class Tournament extends HTMLElement {
	socket: WebSocket | null = null;
	tournamentId: string | null = null;

	constructor() {
		super();
	}

	connectedCallback() {
		this.tournamentId = window.location.pathname.split('/')[2];
		this.render();
		this.handleSocket();
	}

	disconnectedCallback() {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.close();
			console.log('Disconnecting from socket, page unload...');
		}
	}

	render = () => {
		this.innerHTML = `
			<div class="tw-card px-6 py-11 w-full max-w-md text-center">
				<h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
					Waiting for other players to join<br>the Tournament
				</h2>
				<div class="flex justify-center space-x-1 mt-2">
					<div class="h-2 w-2 bg-gray-600 dark:bg-gray-300 rounded-full animate-bounce [animation-delay:0ms]"></div>
					<div class="h-2 w-2 bg-gray-600 dark:bg-gray-300 rounded-full animate-bounce [animation-delay:150ms]"></div>
					<div class="h-2 w-2 bg-gray-600 dark:bg-gray-300 rounded-full animate-bounce [animation-delay:300ms]"></div>
				</div>
			</div>
		`;
	}

	handleSocket = () => {
		this.socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/ws/tournament/${this.tournamentId}`);

		this.socket.onopen = this.handleOpen;
		this.socket.onmessage = this.handleMessage;
		this.socket.onclose = this.handleClose;
		this.socket.onerror = this.handleError;
	}

	handleOpen = () => {
		console.log('WebSocket connection established.');
		this.socket!.send(JSON.stringify({ type: 'joinRoom' }));
	}

	handleMessage = (event: MessageEvent) => {
		const data = JSON.parse(event.data) as WsMatchMakingMessage;

		if (data.type === 'joinedRoom') {
			console.log(data.message);
		}

		if (data.type === 'redirectingToGame') {
			console.log(`Redirecting to game room: ${data.gameRoomId}`);
			setTimeout(() => {
				Router.navigateTo('/game/' + data.gameRoomId);
			}, 100);
		}

		if (data.type === 'victory') {
			console.log(`Victory message: ${data.message}`);
			alert(`Victory! ${data.message}`);
			Router.navigateTo('/home');
		}

		if (data.type === 'Error') {
			console.error(`Error: ${data.message}`);
			alert(`Error: ${data.message}`);
			if(this.socket && this.socket.readyState === WebSocket.OPEN) {
				this.socket.close();
			}
			Router.navigateTo('/home');
		}
	}

	handleClose = () => {
		if(this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.close();
		}
		console.log('WebSocket connection closed.');
	}

	handleError = (event: Event) => {
		alert(`WebSocket error: ${event}`);
		console.error('WebSocket error:', event);
		this.handleClose();
	}
}
