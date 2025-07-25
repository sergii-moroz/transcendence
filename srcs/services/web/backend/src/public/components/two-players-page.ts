export class TwoPlayerPage extends HTMLElement {
  private players: string[] = [];
  private tournamentState: TournamentState | null = null;

  constructor() {
    super();
    this.loadFromLocalStorage();
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  private loadFromLocalStorage() {
    const savedPlayers = localStorage.getItem('tournamentPlayers');
    if (savedPlayers) {
      this.players = JSON.parse(savedPlayers);
    }

    const savedState = localStorage.getItem('tournamentState');
    if (savedState) {
      this.tournamentState = JSON.parse(savedState);
    }
  }

  private saveToLocalStorage() {
    localStorage.setItem('tournamentPlayers', JSON.stringify(this.players));
    if (this.tournamentState) {
      localStorage.setItem('tournamentState', JSON.stringify(this.tournamentState));
    } else {
			localStorage.removeItem('tournamentState')
		}
  }

  private setupEventListeners() {
    this.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      if (target.matches('button.add-player')) {
        this.addPlayer();
      } else if (target.matches('button.start-tournament')) {
        this.startTournament();
      } else if (target.matches('button.clear-tournament')) {
        this.clearTournament();
      } else if (target.matches('button.play-game')) {
				const player1 = target.dataset.player1 || "Player 1"
				const player2 = target.dataset.player2 || "Player 2"
				const matchId = target.dataset.matchId || ""

				this.playGame(player1, player2, matchId)
			} else if (target.matches('button.set-winner')) {
        const matchId = target.dataset.matchId;
        const winnerIndex = target.dataset.winnerIndex;
        if (matchId && winnerIndex) {
          this.setMatchWinner(matchId, parseInt(winnerIndex));
        }
      }
    })

		this.addEventListener('keydown', (e: KeyboardEvent) => {
			const target = e.target as HTMLElement;

			if (target.matches('input') && e.key === 'Enter') {
				this.addPlayer()
			}
		})
  }

  private addPlayer() {
		const input = this.querySelector('input') as HTMLInputElement
		const nickname = this.formatName(input.value.trim())

    if (nickname && !this.players.includes(nickname)) {
      this.players.push(nickname);
      input.value = '';
      this.saveToLocalStorage();
      this.render();
    }
  }

  private clearTournament() {
    this.players = [];
    this.tournamentState = null;
    this.saveToLocalStorage();
    this.render();
  }

  private startTournament() {
    if (this.isValidPlayerCount()) {
      this.tournamentState = createTournamentBracket(this.players);
      this.saveToLocalStorage();
      this.render();
    }
  }

  private setMatchWinner(matchId: string, winnerIndex: number) {
    if (!this.tournamentState) return;

    const match = this.findMatchById(matchId);
    if (!match || match.winner !== null) return;

    // Set the winner
    match.winner = winnerIndex;
    const winnerName = match.players[winnerIndex]?.name || '';

    // Propagate the winner to the next match
    if (match.nextMatchId) {
      const nextMatch = this.findMatchById(match.nextMatchId);
      if (nextMatch) {
				nextMatch.players.push({
            name: winnerName,
            sourceMatch: match.id
          })
      }
    }

    this.saveToLocalStorage();
    this.render();
  }

  private findMatchById(matchId: string): Match | undefined {
    return this.tournamentState?.matches.find(m => m.id === matchId);
  }

  private isValidPlayerCount(): boolean {
    return [2, 4, 8].includes(this.players.length);
  }

  private render() {
    this.innerHTML = `
      <div class="tournament-container space-y-6">
				<div class="tw-card flex justify-center py-6">
					<div class="player-management">
						<div class="flex items-center mb-4">
							<input type="text" placeholder="nickname" class="p-2 tw-input">
							<button class="add-player ml-2 py-2 px-4 bg-blue-500 text-white rounded">Add</button>
						</div>

						<p class="text-gray-500 text-sm mb-4">*Add 2, 4 or 8 nicknames to create a tournament</p>

						<div class="player-list mb-4">
							<h3 class="text-lg font-bold">Players (${this.players.length})</h3>
							<ul class="list-disc pl-5">
								${this.players.map(player => `<li>${player}</li>`).join('')}
							</ul>
						</div>

						<div class="flex space-x-2">
							<button class="start-tournament p-2 bg-green-500 text-white rounded
								${!this.isValidPlayerCount() ? 'opacity-50 cursor-not-allowed' : ''}"
								${!this.isValidPlayerCount() ? 'disabled' : ''}>
								Start Tournament
							</button>
							<button class="clear-tournament p-2 bg-red-500 text-white rounded">
								Clear Tournament
							</button>
						</div>
					</div>
				</div>

        <div class="tournament-bracket">
          ${this.tournamentState ? this.renderTournamentBracket() : ''}
        </div>

				<!-- game container -->
				<div id="game-container" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm hidden">
				</div>
      </div>
    `;

		if (this.tournamentState) {
        this.drawBracketLines();
    }
  }

	private drawBracketLines() {
    const bracket = this.querySelector('#bracket-tree') as HTMLElement;
    if (!bracket) return;

    // Wait for DOM to update
    setTimeout(() => {
        // Remove existing SVG if any
        const existingSvg = bracket.querySelector('svg');
        if (existingSvg) {
            bracket.removeChild(existingSvg);
        }

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "absolute left-0 top-0 pointer-events-none");
        svg.style.width = bracket.offsetWidth + "px";
        svg.style.height = bracket.offsetHeight + "px";
        svg.style.zIndex = "0";

        const roundContainers = Array.from(bracket.querySelectorAll('.round-container'));
        const matchContainersByRound = roundContainers.map(round =>
            Array.from(round.querySelectorAll('.match-container'))
        );

        // For each round except the last, connect matches to next round
        for (let round = 0; round < matchContainersByRound.length - 1; round++) {
            const currentMatches = matchContainersByRound[round];
            const nextMatches = matchContainersByRound[round + 1];

            for (let i = 0; i < nextMatches.length; i++) {
                // Each next match connects to two previous matches
                const prev1 = currentMatches[i * 2] as HTMLElement
                const prev2 = currentMatches[i * 2 + 1] as HTMLElement
                const target = nextMatches[i] as HTMLElement

                if (prev1 && target) {
                    this.drawBracketLine(svg, prev1, target, bracket);
                }
                if (prev2 && target) {
                    this.drawBracketLine(svg, prev2, target, bracket);
                }
            }
        }

        bracket.appendChild(svg);
    }, 50);
	}

	private drawBracketLine(svg: SVGSVGElement, fromEl: HTMLElement, toEl: HTMLElement, container: HTMLElement) {
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

	private formatName(name?: string): string {
		if (!name) return '???';
		return name.length > 8 ? name.slice(0, 8) + '…' : name;
	}

	private renderMatch(match: Match): string {
    const isMatchComplete = match.winner !== null;
    const isFinal = !match.nextMatchId;
    const canSetWinner = !isMatchComplete && match.players.every(p => p !== null);

    // Determine player classes and trophy emoji
    const player1Class = (isMatchComplete && match.winner === 0) || (isFinal && match.players[0]) ? 'text-blue-600 font-bold' : '';
    const player2Class = isMatchComplete && match.winner === 1 ? 'text-blue-600 font-bold' : '';
    const player1Trophy = (isMatchComplete && match.winner === 0) || (isFinal && match.players[0]) ? ' 🏆' : '';
    const player2Trophy = isMatchComplete && match.winner === 1 ? ' 🏆' : '';

    return `
      <div class="tw-card p-4 min-w-[180px] text-center relative shadow-none" style="margin: 12px 0">
        <div class="match-info mb-1 text-xs text-gray-500">
          ${match.id}
        </div>
        <div class="flex flex-col gap-1">
          <div class="flex justify-between items-center">
            <span class="${player1Class}">
              ${match.players[0] ? match.players[0].name : '???'}
              ${player1Trophy}
              ${match.players[0]?.sourceMatch ? `<small class="text-gray-400 text-xs">(${match.players[0].sourceMatch})</small>` : ''}
            </span>
          </div>
					${!isFinal ? `
						<div class="flex justify-between items-center">
							<span class="${player2Class}">
								${match.players[1] ? match.players[1].name : '???'}
								${player2Trophy}
								${match.players[1]?.sourceMatch ? `<small class="text-gray-400 text-xs">(${match.players[1].sourceMatch})</small>` : ''}
							</span>
						</div>` : ""
					}
        </div>
				${!isMatchComplete && !isFinal && match.players.length == 2 ? `
					<button class="play-game tw-btn w-full mt-4"
						data-player1="${match.players[0]?.name}"
						data-player2="${match.players[1]?.name}"
						data-match-id="${match.id}"
					>
						Play
					</button>
				` : ''}
        ${isMatchComplete && !isFinal ? `
          <div class="mt-1 text-xs text-gray-500">
            Advances to ${match.nextMatchId}
          </div>
        ` : ''}
        ${isFinal && isMatchComplete ? `
          <div class="mt-1 p-1 bg-yellow-100 text-sm font-bold rounded">
            Winner: ${match.players[match.winner!]?.name || ''}
          </div>
        ` : ''}
      </div>
    `;
	}

	private renderTournamentBracket(): string {
    if (!this.tournamentState) return '';

    // Group matches by round
    const rounds: Record<number, Match[]> = {};
    this.tournamentState.matches.forEach(match => {
        if (!rounds[match.round]) {
            rounds[match.round] = [];
        }
        rounds[match.round].push(match);
    });

    // Sort rounds
    const sortedRounds = Object.keys(rounds).map(Number).sort((a, b) => a - b);
    const totalRounds = Math.max(...sortedRounds);

    return `
        <div id="bracket-tree" class="flex flex-row gap-8 items-center justify-center relative">
            ${sortedRounds.map(round => `
                <div class="round-container flex flex-col items-center" style="gap: ${rounds[round].length > 4 ? '6px' : '32px'}" data-round="${round}">
                    <h3 class="text-lg font-bold mb-2">${this.getRoundName(round, totalRounds)}</h3>
                    ${rounds[round].map((match, index) => `
                        <div class="match-container" id="match-${match.id}" data-match-id="${match.id}">
                            ${this.renderMatch(match)}
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
    `;
	}

	private getRoundName(round: number, totalRounds: number): string {
			if (round === totalRounds) return 'Winner';
			if (round === totalRounds - 1) return 'Final';
			if (round === totalRounds - 2) return 'Semifinals';
			if (round === totalRounds - 3) return 'Quarterfinals';
			return `Round ${round}`;
	}

	private playGame(player1: string, player2: string, matchId: string) {
		const container = this.querySelector('#game-container')
		container?.classList.remove('hidden')
		if (!container) return

		container.innerHTML = `
			<two-players-game player-1="${player1}" player-2="${player2}" match-id="${matchId}"></two-players-game>
			<div class="flex justify-center mt-2">
				<button id="btn-close" class="tw-btn mx-auto">Close</button>
			<div>
		`

		const btnClose = container.querySelector('#btn-close')
		btnClose?.addEventListener('click', () => {
			container.classList.add('hidden')
			container.innerHTML = ''
		})

		container.addEventListener('game-finished', (event: Event) => {
			const customEvent = event as CustomEvent
			const matchId = customEvent.detail.matchId
			const winnerIndex = customEvent.detail.id

			setTimeout(() => {
				container.classList.add('hidden')
				container.innerHTML = ''

				if (matchId && winnerIndex) {
					this.setMatchWinner(matchId, parseInt(winnerIndex));
				}
			}, 1000);
		})
	}
}

// Data structures
interface TournamentState {
  players: string[];
  matches: Match[];
}

interface Match {
  id: string;
  round: number;
  players: (TournamentPlayer | null)[];
  nextMatchId: string | null;
  winner: number | null; // index of the winning player
}

interface TournamentPlayer {
  name: string;
  sourceMatch?: string; // ID of the match this player came from
}

// Helper function to create tournament bracket
function createTournamentBracket(players: string[]): TournamentState {
  const validCounts = [2, 4, 8];
  if (!validCounts.includes(players.length)) {
    throw new Error(`Invalid number of players. Must be 2, 4, or 8.`);
  }

  const matches: Match[] = [];
  const rounds = Math.log2(players.length) + 1;

  // Create all matches first
  for (let round = 1; round <= rounds; round++) {
    const matchesInRound = round === rounds ? 1 : players.length / Math.pow(2, round);
    for (let i = 0; i < matchesInRound; i++) {
      const matchId = `m${round}-${i+1}`;
      const nextMatchId = round < rounds ? `m${round+1}-${Math.floor(i/2)+1}` : null;

      matches.push({
        id: matchId,
        round,
        players: [],
        nextMatchId,
        winner: null
      });
    }
  }

  // Assign first round matches
  const firstRoundMatches = matches.filter(m => m.round === 1);
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5); // Shuffle players

  for (let i = 0; i < firstRoundMatches.length; i++) {
    const match = firstRoundMatches[i];
    match.players = [
      { name: shuffledPlayers[i*2] },
      i*2+1 < shuffledPlayers.length ? { name: shuffledPlayers[i*2+1] } : null
    ];
  }

  return {
    players: shuffledPlayers,
    matches
  };

}
