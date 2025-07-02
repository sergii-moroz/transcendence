import { API } from "../api-static.js";
import { Router } from "../router-static.js";
import { WsMatchMakingMessage } from "../types.js";
import { Matchup } from "../types/tournament.js";


export class Tournament extends HTMLElement {
	socket: WebSocket | null = null;
	tournamentId: string | null = null;
	matchups: Matchup[] = [];
	maxPlayers: number = 4;

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
			<div id="bracket-tree" class="flex flex-col items-center justify-center mb-8"></div>
			<div class="flex flex-row items-center justify-center gap-3">
				<div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black-400 dark:border-white-400"></div>
				<p id="waiting-message" class="text-sm text-gray-400 text-center m-0">Waiting for other players...</p>
			</div>
		`;
	}

	handleSocket = async () => {
		await API.ping()
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
			}, 10000);
		}

		if (data.type === 'victory') {
			console.log(`Victory message: ${data.message}`);
			setTimeout(() => {
				Router.navigateTo('/tournament-victory-screen');
			}, 10000);
		}

		if (data.type === 'matchupData') {
			if(data.matchups) {
				this.matchups = data.matchups;
			}
			if(data.maxPlayers) {
				this.maxPlayers = data.maxPlayers;
			}
			this.renderBracketTree(this.matchups);
		}

		if (data.type === 'Error') {
			console.error(`Tournament: Error: ${data.message}`);
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
		console.error('Tournament: WebSocket error:', event);
		this.handleClose();
	}

	renderBracketTree(matchups: Matchup[]): void {
		const bracket = this.querySelector('#bracket-tree') as HTMLElement | null;
		if (!bracket) return;

		// Group matchups by round
		const rounds: Record<number, Matchup[]> = {};
		matchups.forEach((m: Matchup) => {
			if (!rounds[m.round]) rounds[m.round] = [];
			rounds[m.round].push(m);
		});

		// Determine initial bracket count and total rounds
		const totalRounds = Math.ceil(Math.log2(this.maxPlayers));

		bracket.innerHTML = '';

		const roundsContainer = document.createElement('div');
		roundsContainer.className = 'flex flex-row gap-8 items-center justify-center';

		for (let round = 1; round <= totalRounds; round++) {
			const roundDiv = document.createElement('div');
			roundDiv.className = 'flex flex-col gap-6 items-center';

			const bracketsInRound = Math.ceil(this.maxPlayers / Math.pow(2, round));
			const roundMatchups = rounds[round] || [];

			for (let i = 0; i < bracketsInRound; i++) {
				const match = roundMatchups[i];
				let p1Name = '?', p2Name = '?', p1Score = 0, p2Score = 0, p1Class = '', p2Class = '';
				let p1Trophy = '', p2Trophy = '';

				if (match) {
					p1Name = match.p1.name;
					p2Name = match.p2.name;
					p1Score = match.p1.score;
					p2Score = match.p2.score;
					if (match && match.winnerId) {
						if (match.p1.id === match.winnerId) {
							p1Class = '--color-primary font-bold';
							p1Trophy = ' 🏆';
						}
						if (match.p2.id === match.winnerId) {
							p2Class = '--color-primary font-bold';
							p2Trophy = ' 🏆';
						}
					}
				}

				const card = document.createElement('div');
				card.className = 'tw-card p-2 min-w-[180px] text-center relative shadow-none';
				card.innerHTML = `
					<div class="flex flex-col gap-1">
						<div class="flex justify-between">
							<span class="${p1Class}">${p1Name}${p1Trophy}</span>
							<span>${p1Score}</span>
						</div>
						<div class="flex justify-between">
							<span class="${p2Class}">${p2Name}${p2Trophy}</span>
							<span>${p2Score}</span>
						</div>
					</div>
				`;
				roundDiv.appendChild(card);
			}

			roundsContainer.appendChild(roundDiv);
		}

		bracket.appendChild(roundsContainer);
	}
}
