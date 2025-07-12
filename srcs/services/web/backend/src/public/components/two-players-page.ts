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
      } else if (target.matches('button.set-winner')) {
        const matchId = target.dataset.matchId;
        const winnerIndex = target.dataset.winnerIndex;
        if (matchId && winnerIndex) {
          this.setMatchWinner(matchId, parseInt(winnerIndex));
        }
      }
    });
  }

  private addPlayer() {
    const input = this.querySelector('input') as HTMLInputElement;
    const nickname = input.value.trim();

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
      <div class="tournament-container">
        <div class="player-management">
          <div class="flex items-center mb-4">
            <input type="text" placeholder="nickname" class="p-2 border rounded">
            <button class="add-player ml-2 p-2 bg-blue-500 text-white rounded">Add</button>
          </div>

          <div class="player-list mb-4">
            <h3 class="text-lg font-bold">Players (${this.players.length})</h3>
            <ul class="list-disc pl-5">
              ${this.players.map(player => `<li>${player}</li>`).join('')}
            </ul>
          </div>

          <div class="flex space-x-2 mb-4">
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

        <div class="tournament-bracket">
          ${this.tournamentState ? this.renderTournamentBracket() : ''}
        </div>
      </div>
    `;

		if (this.tournamentState) {
        this.drawBracketLines();
    }
  }


}
