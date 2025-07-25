export class HomeContent extends HTMLElement {

	constructor() {
		super()
		this.render()
	}

	connectedCallback() {
		// this.addEventListener('click', this.handleClick);
	}

	disconnectedCallback() {
		// this.removeEventListener('click', this.handleClick);
	}

	render() {
		this.innerHTML = `
			<div class="max-w-6xl mx-auto px-11 md:px-4 py-6 space-y-12">

				<!-- grid for the 3 play container -->
				<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">

					<!-- Singleplayer Card -->
					<play-card
						title="Singleplayer"
						description="Play by yourself against our intelligent AI opponent"
						button-text="Play vs AI"
						href="/singleplayer"
						icon="icon-home-single-player"
						accent-color="green"
					></play-card>

					<!-- Multiplayer Card -->
					<play-card
						title="Multiplayer"
						description="Real-time 1v1 matches with random matchmaking"
						button-text="Play 1v1"
						href="/matchmaking"
						icon="icon-home-multiplayer"
						accent-color="blue"
					></play-card>

					<!-- Tournament Card -->
					<play-card
						title="Tournament"
						description="Compete in elimination brackets with 4 players"
						button-text="Play Tournament"
						href="/tournament-list"
						icon="icon-home-tournament"
						accent-color="purple"
					></play-card>

				</div>

				<!-- Stats and Leaderboard Section -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-8">

					<!-- Your Stats container -->
					<stats-card data-owner></stats-card>

					<!-- Leaderboard Container -->
					<top-player-card></top-player-card>

				</div>

				<div class="grid grid-cols-1">
					<play-card
						title="Local games"
						description="Play against your friends"
						button-text="Play local"
						href="/two-players"
						icon="icon-home-two-players"
						accent-color="pink"
					></play-card>
				</div>
			</div>
		`;
	}

}
