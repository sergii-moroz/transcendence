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
	
	setupEventListeners() {
		const socket = new WebSocket('ws://localhost:4242/waiting-room');
		
		//socketEventListeners
		socket.onopen = () => {
			console.log('WebSocket connection established.');
			socket.send(JSON.stringify({ type: 'joinRoom' }));
		}
	
		socket.onmessage = (event) => {
			const data = JSON.parse(event.data) as WsMatchMakingMessage;
	
			if (data.type === 'joinedRoom') {
				console.log(data.message);
			}
	
			if (data.type === 'redirectingToGame') {
				console.log(`Redirecting to game room: ${data.gameRoomId}`);
				socket.close();
				this.router.navigateTo('/about');
			}
		};
		
		socket.onclose = () => {
			console.log('WebSocket connection closed.');
		};
	
		socket.onerror = (err) => {
			console.error('WebSocket error:', err);
		};
	

		//normal eventListeners
		this.addEventListener(document.getElementById('home-link')!, 'click', (e) => {
			e.preventDefault();
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.close();
				console.log('Disconnecting from socket...');
			}
			return this.router.navigateTo('/home');
		});

		this.addEventListener(window, 'beforeunload', (e) => {
			e.preventDefault();
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.close();
				console.log('Disconnecting from socket, page unload...');
			}
		});
	};
}
