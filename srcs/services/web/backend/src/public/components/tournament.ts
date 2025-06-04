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
			<h2>In the tournament, waiting for other players...</h2>
			<p id="waiting-message">Waiting for other players to join...</p>
		`;
	}

	handleSocket = () => {
		this.socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/ws/tournament/${this.tournamentId}`);
		if(!this.socket) {
			console.error('WebSocket connection failed.');
			Router.navigateTo('/home');
			return;
		}
		
		this.socket!.onopen = () => {
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
		};
		
		this.socket.onclose = () => {
			console.log('WebSocket connection closed.');
		};
	
		this.socket.onerror = (err) => {
			alert(`WebSocket error: ${err}`);
			console.error('WebSocket error:', err);
			if(this.socket && this.socket.readyState === WebSocket.OPEN) {
				this.socket.close();
			}
			// Router.navigateTo('/home');
		};
	}
}
