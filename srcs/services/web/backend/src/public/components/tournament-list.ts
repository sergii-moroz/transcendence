import { Router } from "../router-static.js"
import { tournamentListJson } from "../types.js";

export class TournamentList extends HTMLElement {
	socket: WebSocket | null = null;

	constructor() {
		super();
	}

	connectedCallback() {
		this.render();
		this.handleSocket();
		document.addEventListener('click', this.handleClick);
	}

	disconnectedCallback() {
		this.handleClose();
		document.removeEventListener('click', this.handleClick);
	}

	render = () => {
		this.innerHTML = `
			<div class="flex items-center justify-between mb-4 mt-6">
				<h2 class="text-xl font-bold">Active tournaments</h2>
				<button id="create-tournament" class="tw-btn w-20 mt-6">New</button>
			</div>
			<ul id="tournament-list"></ul>
		`;
	}

	handleSocket = () => {
		this.socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/ws/tournament-list`);

		this.socket.onopen = () => {
			console.log('WebSocket connection established.');
		}
		this.socket.onmessage = this.handleMessage;
		this.socket.onclose = this.handleClose;
		this.socket.onerror = this.handleError;
	}

	handleClick = (event: Event) => {
		const target = event.target as HTMLElement;

		if (target.closest('#create-tournament')) {
			this.socket?.send(JSON.stringify({ type: 'createTournament' }));
		}
	}

	handleMessage = (event: MessageEvent) => {
		const data = JSON.parse(event.data) as tournamentListJson;
		if (data.type === 'tournamentList') {
			this.updateTournamentList(data.tournaments);
		}

		if (data.type === 'redirectingToTournament') {
			if(this.socket && this.socket.readyState === WebSocket.OPEN) {
				this.socket.close();
			}
			console.log(`Redirecting to tournament: ${data.tournamentId}`);
			Router.navigateTo('/tournament/' + data.tournamentId);
		}
	}

	handleClose = () => {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.close();
			console.log('Disconnecting from socket, page unload...');
		}
		console.log('WebSocket connection closed.');
	}

	handleError = (event: Event) => {
		alert(`WebSocket error: ${event}`);
		console.error('WebSocket error:', event);
	}

	updateTournamentList(tournaments: Array<{ id: string, playerCount: number, maxPlayers: number }> | undefined) {
		const listElement = document.getElementById('tournament-list')!;
		if (!listElement) {
			console.error('Tournament list element not found.');
			return;
		}
		listElement.innerHTML = '';

		console.log('updateTournamentList called with:', tournaments);

		if(!tournaments || tournaments.length === 0) {
			listElement.innerHTML = '<li class="tw-card p-4 mb-4">No active tournaments available.</li>';
		} else {
			tournaments.forEach(tournament => {
				const card = document.createElement('li');
				card.className = 'tw-card p-4 mb-4 flex items-center justify-between';

				card.innerHTML = `
					<div>
						<strong>Tournament ID:</strong> ${tournament.id}<br>
						<strong>Players:</strong> ${tournament.playerCount} / ${tournament.maxPlayers}
					</div>
					<button
						id="join-tournament-${tournament.id}"
						class="tw-btn ml-4"
						data-tournament-id="${tournament.id}"
						${tournament.playerCount >= tournament.maxPlayers ? 'disabled' : ''}
					>
						${tournament.playerCount >= tournament.maxPlayers ? 'Full' : 'Join'}
					</button>
				`;

				// Add join button handler if not full
				const joinBtn = card.querySelector('button');
					joinBtn?.addEventListener('click', (e) => {
						e.stopPropagation(); // Prevent bubbling to the card
						this.socket?.send(JSON.stringify({
							type: 'joinTournament',
							tournamentId: tournament.id
						}));
						console.log(`Joining tournament: ${tournament.id}`);
					});

				listElement.appendChild(card);
			});
		}
	}
}
