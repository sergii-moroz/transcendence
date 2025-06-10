import { Router } from "../../router-static.js";

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

	// async handleClick(event: Event) {
	// 	const target = event.target as HTMLElement;

	// 	if (target.closest('#singleplayer-btn')) {
	// 		alert('not available');
	// 	}
	// 	else if (target.closest('#multiplayer-btn')) {
	// 		Router.navigateTo('/matchmaking');
	// 	}
	// 	else if (target.closest('#tournament-btn')) {
	// 		Router.navigateTo('/tournament-list');
	// 	}
	// 	else if (target.closest('#viewProfile-btn')) {
	// 		Router.navigateTo('/settings');
	// 	}
	// 	else if (target.closest('#viewLeaderboard-btn')) {
	// 		Router.navigateTo('/about');
	// 	}
	// }

	render() {
		this.innerHTML = `
			<div class="max-w-6xl mx-auto px-4 py-6 space-y-12">

				<!-- grid for the 3 play container -->
				<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">

					<!-- Singleplayer Card -->
					<play-card
						title="Singleplayer"
						description="Play by yourself against our intelligent AI opponent"
						button-text="Play vs AI"
						href="/settings"
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
						button-text="Join"
						href="/tournament-list"
						icon="icon-home-tournament"
						accent-color="purple"
					></play-card>

				</div>

				<!-- Stats and Leaderboard Section -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-8">

					<!-- Your Stats container -->
					<stats-card></stats-card>

					<!-- Leaderboard Container -->
					<top-player-card></top-player-card>

				</div>
			</div>
		`;
	}

}
