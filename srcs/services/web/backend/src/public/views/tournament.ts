import { View } from "../view.js"
import { WsMatchMakingMessage } from "../types.js";


export class TournamentView extends View {
	tournamentId!: string;

	setContent = () => {
		this.element.innerHTML = `
			<h2>In the tournament, waiting for other players...</h2>
			<p id="waiting-message">Waiting for other players to join...</p>
			<button id="home-link">Home</button>
		`;
	}

	mount = async (parent: HTMLElement) => {
		const input = await this.prehandler();
		if (!input) {
			alert ("cant load API data");
			return this.router.navigateTo('/'); //somewhere else
		}
		this.tournamentId = window.location.pathname.split('/')[2];
		console.log('Tournament ID:', this.tournamentId);

		this.setContent();
		parent.append(this.element);
		this.setupEventListeners();
	}

	handleSocket = () => {
			this.socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/ws/tournament/${this.tournamentId}`);
			if(!this.socket) {
				console.error('WebSocket connection failed.');
				this.router.navigateTo('/home');
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
					this.socket?.close();
					setTimeout(() => {
						this.router.navigateTo('/game/' + data.gameRoomId);
					}, 100);
				}

				if (data.type === 'victory') {
					console.log(`Victory message: ${data.message}`);
					alert(`Victory! ${data.message}`);
					this.socket?.close();
					this.router.navigateTo('/home');
				}

				if (data.type === 'Error') {
					console.error(`Error: ${data.message}`);
					alert(`Error: ${data.message}`);
					if(this.socket && this.socket.readyState === WebSocket.OPEN) {
						this.socket.close();
					}
					this.router.navigateTo('/home');
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
				this.router.navigateTo('/home');
			};
		}
		
		setupEventListeners() {
			this.handleSocket();
			this.addEventListener(document.getElementById('home-link')!, 'click', (e) => {
				e.preventDefault();
				this.socket!.close();
				return this.router.navigateTo('/home');
			});
	
			this.addEventListener(window, 'beforeunload', (e) => {
				e.preventDefault();
				this.socket!.close();
				console.log('Disconnecting from socket, page unload...');
			});
		};
}