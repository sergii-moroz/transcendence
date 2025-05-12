import { View } from "../view.js"

import { WsMatchMakingMessage } from "../types.js";

export class WaitingView extends View {
	setContent = () => {
		this.element.innerHTML = `
		<h2>Waiting for other players...</h2>
		<p id="waiting-message">Waiting for other players to join...</p>
		<button id="home-link">Home</button>
		`;
	}
	handleSocket = () => {
		this.socket = new WebSocket('ws://localhost:4242/ws/waiting-room');
		
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
				this.router.navigateTo('/game/' + data.gameRoomId);
			}
		};
		
		this.socket.onclose = () => {
			// console.log('WebSocket connection closed.');
		};
	
		this.socket.onerror = (err) => {
			alert(`WebSocket error: ${err}`);
			console.error('WebSocket error:', err);
			this.router.navigateTo('/home');
		};
	}
	
	setupEventListeners() {
		this.handleSocket();
		this.addEventListener(document.getElementById('home-link')!, 'click', (e) => {
			e.preventDefault();
			return this.router.navigateTo('/home');
		});

		this.addEventListener(window, 'beforeunload', (e) => {
			e.preventDefault();
			if (this.socket && this.socket.readyState === WebSocket.OPEN) {
				this.socket.close();
				console.log('Disconnecting from socket, page unload...');
			}
		});
	};
}
