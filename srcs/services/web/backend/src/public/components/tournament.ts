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
			<div class="flex flex-col items-center justify-center mb-8">
				<h2 class="text-4xl text-center font-bold">TOURNAMENT</h2>
			</div>
			<div class="flex flex-col items-center mb-2">
				<!-- Loading spinner -->
				<div class="animate-spin rounded-full h-15 w-15 border-t-4 border-b-4 border-black-400 dark:border-white-400"></div>
				<p id="waiting-message" class="text-sm text-gray-400 text-center mt-2">Waiting for other players...</p>
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
			document.getElementById('waiting-message')!.textContent = `Matching up against ${data.opponentId}...`;

			setTimeout(() => {
				Router.navigateTo('/game/' + data.gameRoomId);
			}, 2000);
		}

		if (data.type === 'victory') {
			console.log(`Victory message: ${data.message}`);
			Router.navigateTo('/tournament-victory-screen');
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
