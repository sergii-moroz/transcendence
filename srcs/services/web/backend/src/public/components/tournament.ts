import { Router } from "../router-static.js";
import { WsMatchMakingMessage } from "../types.js";
import { Matchup } from "../types/tournament.js";


export class Tournament extends HTMLElement {
	socket: WebSocket | null = null;
	tournamentId: string | null = null;
	matchups: Matchup[] = [];

	constructor() {
		super();
	}

	connectedCallback() {
		this.tournamentId = window.location.pathname.split('/')[2];
		this.render();
		this.renderBracketTree(this.matchups);
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
			<div id="bracket-tree" class="flex flex-col items-center justify-center mb-8">
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
			document.getElementById('waiting-message')!.textContent = `Matching up against ${data.opponentName}...`;

			setTimeout(() => {
				Router.navigateTo('/game/' + data.gameRoomId);
			}, 2000);
		}

		if (data.type === 'victory') {
			console.log(`Victory message: ${data.message}`);
			Router.navigateTo('/tournament-victory-screen');
		}

		if (data.type === 'matchupData') {
			if(data.matchups) {
				this.matchups = data.matchups;
			}
			this.renderBracketTree(this.matchups);
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

	renderBracketTree(matchups: Matchup[]): void {
		const bracket = this.querySelector('#bracket-tree') as HTMLElement | null;
		if (!bracket) return;

		// Handle empty or missing matchups
		if (!matchups || matchups.length === 0) {
			bracket.innerHTML = `<div class="text-center text-gray-400 py-8">No matchups to display yet.</div>`;
			return;
		}

		const rounds: Record<number, Matchup[]> = {};
		matchups.forEach((m: Matchup) => {
			if (!rounds[m.round]) rounds[m.round] = [];
			rounds[m.round].push(m);
		});

		bracket.innerHTML = '';

		const roundsContainer = document.createElement('div');
		roundsContainer.className = 'flex flex-row-reverse gap-8 items-center justify-center';

		Object.keys(rounds)
			.map(Number)
			.sort((a, b) => b - a)
			.forEach((roundNum) => {
				const roundDiv = document.createElement('div');
				roundDiv.className = 'flex flex-col gap-6 items-center';

				rounds[roundNum].forEach((match: Matchup) => {
					const card = document.createElement('div');
					card.className = 'tw-card p-2 min-w-[180px] text-center relative';
					card.innerHTML = `
						<div class="flex flex-col gap-1">
							<div class="flex justify-between">
								<span>${match.p1.name}</span>
								<span>${match.p1.score}</span>
							</div>
							<div class="flex justify-between">
								<span>${match.p2.name}</span>
								<span>${match.p2.score}</span>
							</div>
						</div>
						${match.winnerId ? `<div class="mt-1 text-xs text-green-600">Winner: ${match.p1.id === match.winnerId ? match.p1.name : match.p2.name}</div>` : ''}
					`;
					roundDiv.appendChild(card);
				});

				roundsContainer.appendChild(roundDiv);
			});

		bracket.appendChild(roundsContainer);
	}
}
