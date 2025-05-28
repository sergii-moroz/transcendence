import { WsMatchMakingMessage } from "../types.js";
import { Router } from "../router-static.js"

export class WaitingRoom extends HTMLElement {
	socket: WebSocket | null = null;

	constructor() {
		super();
	}

	connectedCallback() {
		this.render();
		this.handleSocket();
		this.addEventListener('click', this.handleClick);
	}

	disconnectedCallback() {
		this.removeEventListener('click', this.handleClick);
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.close();
			console.log('Disconnecting from socket, page unload...');
		}
	}

	handleSocket = () => {
		this.socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/ws/waiting-room`);
		
		this.socket.onopen = () => {
			console.log('WebSocket connection established.');
			this.socket!.send(JSON.stringify({ type: 'joinRoom' }));
		}
	
		this.socket.onmessage = (event) => {
			const data = JSON.parse(event.data) as WsMatchMakingMessage;
	
			if (data.type === 'joinedRoom') {
				console.log(data.message);
			}
	
			if (data.type === 'redirectingToGame') {
				console.log(`Redirecting to game room: ${data.gameRoomId}`);
				Router.navigateTo('/game/' + data.gameRoomId);
			}
		};
		
		this.socket.onclose = () => {
			console.log('WebSocket connection closed.');
		};
	
		this.socket.onerror = (err) => {
			alert(`WebSocket error: ${err}`);
			console.error('WebSocket error:', err);
			Router.navigateTo('/home');
		};
	}

	handleClick = (event: Event) => {
		const target = event.target as HTMLElement;

		if (target.closest('#home-btn')) {
			if (this.socket && this.socket.readyState === WebSocket.OPEN) {
				this.socket.close();
				console.log('Disconnecting from socket, navigating home...');
				Router.navigateTo('/home');
			}
		}
	}

	render() {
		this.innerHTML = `
			<div class="flex flex-col items-center justify-center h-full min-h-screen">
				<h2>Waiting for other players...</h2>
				<p id="waiting-message">Waiting for other players to join...</p>
				<button id="home-btn" class="tw-btn-outline w-20 mt-6">Home</button>
			</div>
		`;
	}
}