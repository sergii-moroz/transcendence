import { View } from "../view.js"

export class WaitingView extends View {
	setContent = () => {
		this.element.innerHTML = `
		<h2>Waiting for other players...</h2>
		<p id="waiting-message">Waiting for other players to join...</p>
		<button id="home-link">Home</button>
		`;
	}

	// async prehandler() {
		// return (this.router.currentUser ? this.router.currentUser.username : null);
	// }

	mount = async (parent) => {
		parent.innerHTML = '';

		const input = await this.prehandler();
		this.setContent(input);
		parent.append(this.element);


		const socket = this.handleSocket();
		this.setupEventListeners(socket);
	}

	handleSocket = () => {
		const socket = new WebSocket('ws://localhost:4242/matchmaking')
	
		socket.addEventListener('open', () => {
			const username = this.router.currentUser.username;
			socket.send(JSON.stringify({ type: 'joinRoom', username }));
		});

		socket.addEventListener('message', (event) => {
			const data = JSON.parse(event.data);

			if (data.type === 'joinedRoom') {
				alert(data.message);
				console.log(data.message);
			}

			if (data.type === 'redirectingToGame') {
				console.log(`Redirecting to game room: ${data.gameRoomId}`);
				socket.close();
				this.router.navigateTo('/about');
			}
		});
		
		
		socket.addEventListener('close', () => {
			console.log('WebSocket connection closed.');
		});

		socket.addEventListener('error', (err) => {
			console.error('WebSocket error:', err);
		});

		return (socket);
	}

	setupEventListeners(socket) {
		const form = document.getElementById('home-link');
		this.addEventListener(form, 'click', (e) => {
			e.preventDefault();
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.close();
				console.log('Disconnecting from socket...');
			}
			console.log('Disconnecting from socket...');
			return this.router.navigateTo('/home');
		});

		this.addEventListener(window, 'beforeunload', (e) => {
			e.preventDefault();
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.close();
				console.log('Disconnected from socket due to page unload');
			}
		});
	};
}
