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
			<div class="flex flex-row items-center justify-center gap-3">
				<a href="" id="play-button" class="tw-btn-disabled w-20 mt-6" data-link> Play </button>
				<a href="/home" class="tw-btn w-20 mt-6" data-link> Home </a>
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

		if (data.type === 'redirectToGame') {
			if(data.opponentName) {
				document.getElementById('waiting-message')!.textContent = `Matching up against ${data.opponentName}...`;
			} else {
				document.getElementById('waiting-message')!.textContent = data.message || 'Matchup found, redirecting to game room...';
			}
			this.enablePlayButton(data);
			// setTimeout(() => {
			// 	Router.navigateTo('/game/' + data.gameRoomId);
			// }, 10000);
		}

		if (data.type === 'victory') {
			console.log(`Victory message: ${data.message}`);
			Router.navigateTo('/tournament-victory-screen');
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

	enablePlayButton = (data: WsMatchMakingMessage) => {
		console.log(`enabling play button that redirecting to game room: ${data.gameRoomId}`);
		const playButton = this.querySelector('#play-button') as HTMLAnchorElement;
		if (!playButton) return;

		playButton.classList.remove('tw-btn-disabled');
		playButton.classList.add('tw-btn');
		playButton.classList.add('bg-green-500');
		playButton.classList.add('hover:border-green-500');
		playButton.classList.add('hover:text-green-500');
		playButton.classList.add('hover:bg-transparent');
		playButton.href = `/game/${data.gameRoomId}`;
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

		const totalRounds = Math.ceil(Math.log2(this.maxPlayers));
		bracket.innerHTML = '';

		const roundsContainer = document.createElement('div');
		roundsContainer.className = 'flex flex-row gap-8 items-center justify-center relative';

		// Store card elements for line drawing
		const cardRefs: HTMLElement[][] = [];

		for (let round = 1; round <= totalRounds; round++) {
			const roundDiv = document.createElement('div');
			roundDiv.className = 'flex flex-col items-center';
			const bracketsInRound = Math.ceil(this.maxPlayers / Math.pow(2, round));
			const gapPx = bracketsInRound > 4
				? 6 : 32;
			roundDiv.style.gap = `${gapPx}px`;
			const roundMatchups = rounds[round] || [];
			const roundCards: HTMLElement[] = [];

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
				card.style.margin = "12px 0";
				card.id = `bracket-card-r${round}-i${i}`;
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
				roundCards.push(card);
			}
			cardRefs.push(roundCards);
			roundsContainer.appendChild(roundDiv);
		}

		bracket.appendChild(roundsContainer);

		// --- SVG lines ---
		// Wait for DOM to update and layout
		setTimeout(() => {
			const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("class", "absolute left-0 top-0 pointer-events-none");
			svg.style.width = roundsContainer.offsetWidth + "px";
			svg.style.height = roundsContainer.offsetHeight + "px";
			svg.style.zIndex = "0";

			// For each round except the last, connect each pair to the next round
			for (let round = 0; round < cardRefs.length - 1; round++) {
				const curr = cardRefs[round];
				const next = cardRefs[round + 1];
				for (let i = 0; i < next.length; i++) {
					// Each next card is connected to two previous cards (single-elim)
					const prev1 = curr[i * 2];
					const prev2 = curr[i * 2 + 1];
					const target = next[i];

					if (prev1 && target) {
						this.drawBracketLine(svg, prev1, target, roundsContainer);
					}
					if (prev2 && target) {
						this.drawBracketLine(svg, prev2, target, roundsContainer);
					}
				}
			}
			roundsContainer.appendChild(svg);
		}, 0);
	}

	drawBracketLine(svg: SVGSVGElement, fromEl: HTMLElement, toEl: HTMLElement, container: HTMLElement) {
		const fromRect = fromEl.getBoundingClientRect();
		const toRect = toEl.getBoundingClientRect();
		const containerRect = container.getBoundingClientRect();

		// Start at right center of fromEl, end at left center of toEl
		const startX = fromRect.right - containerRect.left;
		const startY = fromRect.top + fromRect.height / 2 - containerRect.top;
		const endX = toRect.left - containerRect.left;
		const endY = toRect.top + toRect.height / 2 - containerRect.top;

		// 90-degree turn: horizontal, then vertical
		const midX = (startX + endX) / 2;

		const points = [
			[startX, startY],
			[midX, startY],
			[midX, endY],
			[endX, endY]
		];

		const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
		polyline.setAttribute("points", points.map(p => p.join(",")).join(" "));
		polyline.setAttribute("stroke", "#94a3b8"); // slate-400
		polyline.setAttribute("stroke-width", "2");
		polyline.setAttribute("fill", "none");
		polyline.setAttribute("opacity", "1");
		svg.appendChild(polyline);
	}

	//function drawBracketLine(svg: SVGSVGElement, fromEl: HTMLElement, toEl: HTMLElement, container: HTMLElement) {
	//	const fromRect = fromEl.getBoundingClientRect();
	//	const toRect = toEl.getBoundingClientRect();
	//	const containerRect = container.getBoundingClientRect();

	//	// Start at right center of fromEl, end at left center of toEl
	//	const startX = fromRect.right - containerRect.left;
	//	const startY = fromRect.top + fromRect.height / 2 - containerRect.top;
	//	const endX = toRect.left - containerRect.left;
	//	const endY = toRect.top + toRect.height / 2 - containerRect.top;

	//	// 90-degree turn: horizontal, then vertical
	//	const midX = (startX + endX) / 2;

	//	const points = [
	//		[startX, startY],
	//		[midX, startY],
	//		[midX, endY],
	//		[endX, endY]
	//	];

	//	const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
	//	polyline.setAttribute("points", points.map(p => p.join(",")).join(" "));
	//	polyline.setAttribute("stroke", "#94a3b8"); // slate-400
	//	polyline.setAttribute("stroke-width", "2");
	//	polyline.setAttribute("fill", "none");
	//	polyline.setAttribute("opacity", "0.7");
	//	svg.appendChild(polyline);
	//}

	//renderBracketTree(matchups: Matchup[]): void {
	//	const bracket = this.querySelector('#bracket-tree') as HTMLElement | null;
	//	if (!bracket) return;

	//	// Group matchups by round
	//	const rounds: Record<number, Matchup[]> = {};
	//	matchups.forEach((m: Matchup) => {
	//		if (!rounds[m.round]) rounds[m.round] = [];
	//		rounds[m.round].push(m);
	//	});

	//	// Determine initial bracket count and total rounds
	//	const totalRounds = Math.ceil(Math.log2(this.maxPlayers));

	//	bracket.innerHTML = '';

	//	const roundsContainer = document.createElement('div');
	//	roundsContainer.className = 'flex flex-row gap-8 items-center justify-center';

	//	for (let round = 1; round <= totalRounds; round++) {
	//		const roundDiv = document.createElement('div');
	//		roundDiv.className = 'flex flex-col gap-6 items-center';

	//		const bracketsInRound = Math.ceil(this.maxPlayers / Math.pow(2, round));
	//		const roundMatchups = rounds[round] || [];

	//		for (let i = 0; i < bracketsInRound; i++) {
	//			const match = roundMatchups[i];
	//			let p1Name = '?', p2Name = '?', p1Score = 0, p2Score = 0, p1Class = '', p2Class = '';
	//			let p1Trophy = '', p2Trophy = '';

	//			if (match) {
	//				p1Name = match.p1.name;
	//				p2Name = match.p2.name;
	//				p1Score = match.p1.score;
	//				p2Score = match.p2.score;
	//				if (match && match.winnerId) {
	//					if (match.p1.id === match.winnerId) {
	//						p1Class = '--color-primary font-bold';
	//						p1Trophy = ' 🏆';
	//					}
	//					if (match.p2.id === match.winnerId) {
	//						p2Class = '--color-primary font-bold';
	//						p2Trophy = ' 🏆';
	//					}
	//				}
	//			}

	//			const card = document.createElement('div');
	//			card.className = 'tw-card p-2 min-w-[180px] text-center relative shadow-none';
	//			card.innerHTML = `
	//				<div class="flex flex-col gap-1">
	//					<div class="flex justify-between">
	//						<span class="${p1Class}">${p1Name}${p1Trophy}</span>
	//						<span>${p1Score}</span>
	//					</div>
	//					<div class="flex justify-between">
	//						<span class="${p2Class}">${p2Name}${p2Trophy}</span>
	//						<span>${p2Score}</span>
	//					</div>
	//				</div>
	//			`;
	//			roundDiv.appendChild(card);
	//		}

	//		roundsContainer.appendChild(roundDiv);
	//	}

	//	bracket.appendChild(roundsContainer);
	//}
}
