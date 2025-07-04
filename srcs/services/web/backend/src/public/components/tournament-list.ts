import { join } from "path";
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
		this.addEventListener('click', this.handleClick);
	}

	disconnectedCallback() {
		this.handleClose();
		this.removeEventListener('click', this.handleClick);
	}

	render = () => {
		this.innerHTML = `
			<div class="tw-card p-4">
				<div class="flex items-center justify-between mb-4 w-full">
					<h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
						Active Tournaments
					</h2>
					<button id="create-tournament" class="tw-btn w-24">
						New
					</button>
				</div>

				<ul id="tournament-list" class="space-y-4"></ul>
			</div>

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
		else if (target.closest('#close-create-tournament')) {
			this.querySelector('#create-tournament-popup')?.remove();
		}

		const createBtn = target.closest('button[data-size]');
		if (createBtn) {
			const size = createBtn.getAttribute('data-size');
			console.log(`size: ${size}`);
			this.socket?.send(JSON.stringify({ type: 'createTournament', maxPlayers: Number(size) }));
			console.log(`Creating tournament with ${size} players...`);
			this.querySelector('#create-tournament-popup')?.remove();
		}
		
		const joinBtn = target.closest('button[data-tournament-id]');
		if (joinBtn) {
			const tournamentId = joinBtn.getAttribute('data-tournament-id');
			this.socket?.send(JSON.stringify({
				type: 'joinTournament',
				tournamentId
			}));
			console.log(`Joining tournament: ${tournamentId}`);
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
		const existing = this.querySelector('#create-tournament-popup');
		if (existing) existing.remove();

		const popup = document.createElement('div');
		popup.id = 'create-tournament-popup';
		popup.className = 'fixed inset-0 flex items-center justify-center z-50';
		popup.innerHTML = `
			<div id="backdrop"
				class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40">
			</div>
			<div class="tw-card p-8 flex flex-col items-center z-50 m-6 w-full max-w-md">
				<h3 class="text-lg font-bold mb-6 text-center">Create Tournament</h3>

				<div class="flex gap-4 mb-6 w-full justify-center items-center">
					<button class="tw-btn flex flex-col items-center justify-center size-24 sm:size-28 text-4xl font-extrabold rounded-lg shadow transition" data-size="4">
						<span class="text-4xl sm:text-5xl leading-none">4</span>
						<span class="text-xs mt-2">players</span>
					</button>
					<button class="tw-btn flex flex-col items-center justify-center size-24 sm:size-28 text-4xl font-extrabold rounded-lg shadow transition" data-size="8">
						<span class="text-4xl sm:text-5xl leading-none">8</span>
						<span class="text-xs mt-2">players</span>
					</button>
					<button class="tw-btn flex flex-col items-center justify-center size-24 sm:size-28 text-4xl font-extrabold rounded-lg shadow transition" data-size="16">
						<span class="text-4xl sm:text-5xl leading-none">16</span>
						<span class="text-xs mt-2">players</span>
					</button>
				</div>

				<button class="tw-btn w-full px-4 py-2 text-gray-700 dark:text-gray-300 font-medium bg-gray-100 dark:bg-gray-700" id="close-create-tournament">Cancel</button>
			</div>
		`;
		this.appendChild(popup);
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
			listElement.innerHTML = '<li class="tw-card py-4 px-6 bg-gray-50 dark:bg-gray-700/50 shadow-none hover:scale-[1.01]">No active tournaments available.</li>';
		} else {
			tournaments.forEach(tournament => {
				const card = document.createElement('li');
				card.className = 'tw-card py-4 px-6 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 shadow-none hover:scale-[1.01]';

				card.innerHTML = `
					<div class='flex flex-col gap-0.5'>
						<p class='dark:text-gray-400 font-light text-xs text-gray-500'>Tournament ID: ${tournament.id}</p>
						<div class='flex items-center gap-3 w-full'>
							<div class="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
								<div class="h-full bg-indigo-500" style="width: ${
									(tournament.playerCount / tournament.maxPlayers) * 100 }%">
								</div>
							</div>
							<p class="text-sm font-medium text-gray-700 dark:text-gray-200">${tournament.isRunning ? tournament.maxPlayers : tournament.playerCount} / ${tournament.maxPlayers} players</p>
						</div>
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

				listElement.appendChild(card);
			});
		}
	}
}