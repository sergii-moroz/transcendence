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
			<div class="flex items-center justify-between mb-4 mt-6 min-w-[75vw]">
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
			this.showCreateTournamentPopup();
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

	showCreateTournamentPopup = () => {
		// Remove existing popup if any
		const existing = document.getElementById('create-tournament-popup');
		if (existing) existing.remove();

		const popup = document.createElement('div');
		popup.id = 'create-tournament-popup';
		popup.className = 'fixed inset-0 flex items-center justify-center z-50';
		popup.innerHTML = `
			<div id="backdrop"
				class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden">
			</div>
			<div class="tw-card p-8 rounded shadow-lg flex flex-col items-center z-50">
				<h3 class="text-lg font-bold mb-6">Create Tournament</h3>
				<div class="flex gap-6 mb-6">
					<button class="tw-btn flex flex-col items-center justify-center w-28 h-28 text-4xl font-extrabold rounded-lg shadow transition hover:bg-blue-200" data-size="4">
						<span class="text-5xl leading-none">4</span>
						<span class="text-xs mt-2">players</span>
					</button>
					<button class="tw-btn flex flex-col items-center justify-center w-28 h-28 text-4xl font-extrabold rounded-lg shadow transition hover:bg-blue-200" data-size="8">
						<span class="text-5xl leading-none">8</span>
						<span class="text-xs mt-2">players</span>
					</button>
					<button class="tw-btn flex flex-col items-center justify-center w-28 h-28 text-4xl font-extrabold rounded-lg shadow transition hover:bg-blue-200" data-size="16">
						<span class="text-5xl leading-none">16</span>
						<span class="text-xs mt-2">players</span>
					</button>
				</div>
				<button class="tw-btn mt-2" id="close-create-tournament">Cancel</button>
			</div>
		`;
		document.body.appendChild(popup);

		// Handle button clicks
		popup.querySelectorAll('button[data-size]').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const size = (e.currentTarget as HTMLElement).getAttribute('data-size');
				this.socket?.send(JSON.stringify({ type: 'createTournament', maxPlayers: Number(size) }));
				console.log(`Creating tournament with ${size} players...`);
				popup.remove();
			});
		});
		popup.querySelector('#close-create-tournament')?.addEventListener('click', () => popup.remove());
	}

	updateTournamentList(tournaments: Array<{ id: string, playerCount: number, maxPlayers: number, isRunning: boolean }> | undefined) {
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
						class="${tournament.isRunning ? 'tw-btn-disabled' : 'tw-btn'} ml-4"
						data-tournament-id="${tournament.id}"
						${tournament.isRunning ? 'disabled' : ''}
					>
						${tournament.isRunning ? 'Full' : 'Join'}
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
