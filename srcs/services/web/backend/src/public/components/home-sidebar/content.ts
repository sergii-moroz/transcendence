import { API } from "../../api-static.js"
import { Router } from "../../router-static.js";

import {
	iconHomeStats,
	iconHomeTrophy,
	iconHomeRocket
} from "../icons/icons.js"

export class HomeContent extends HTMLElement {
	data: any;
	loaded: boolean;

	constructor() {
		super()
		this.loaded = false;
		this.innerHTML = '<div class="flex items-center justify-center h-full min-h-screen"> <h2>loading...</h2></div>';
	}

	async fetchData() {
		try {
			this.data = await API.getHome();
			if (!this.data) {
				this.showErrorState();
			}
			this.loaded = true;
			this.render();
		} catch (error) {
			console.error("Error fetching Home data:", error);
			this.showErrorState();
		}
	}

	connectedCallback() {
		this.fetchData();
		this.addEventListener('click', this.handleClick);
	}

	disconnectedCallback() {
		this.removeEventListener('click', this.handleClick);
	}

	async handleClick(event: Event) {
		const target = event.target as HTMLElement;

		if (target.closest('#viewProfile-btn')) {
			Router.navigateTo('/settings');
		}
		else if (target.closest('#viewLeaderboard-btn')) {
			Router.navigateTo('/about');
		}
	}

	render() {
		if (!this.loaded) return;
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
						href="/waiting-room"
						icon="icon-home-multiplayer"
						accent-color="blue"
					></play-card>

					<!-- Tournament Card -->
					<play-card
						title="Tournament"
						description="Compete in elimination brackets with 4 players"
						button-text="Join"
						href="/tournament-room"
						icon="icon-home-tournament"
						accent-color="purple"
					></play-card>

				</div>

				<!-- Stats and Leaderboard Section -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-8">

					<!-- Your Stats container -->
					<div class="dark:bg-gray-800 bg-white rounded-2xl overflow-hidden border dark:border-gray-700 border-gray-200 flex flex-col h-full transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
						<div class="p-6 flex-1">
							<div class="flex items-center mb-6">
								<div class="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center mr-4">
									${iconHomeStats}
								</div>
								<h3 class="text-xl font-bold text-white">Your Stats</h3>
							</div>

							<div class="grid grid-cols-3 gap-4 mb-6">
								<div class="dark:bg-gray-700/50 bg-gray-100 rounded-lg p-3 text-center dark:hover:bg-gray-700/60 hover:bg-gray-100/60 transition-colors">
									<div class="text-2xl font-bold mb-1">${this.data.stats.matches}</div>
									<div class="text-xs dark:text-gray-400 text-gray-500">Matches</div>
								</div>
								<div class="dark:bg-gray-700/50 bg-gray-100 rounded-lg p-3 text-center dark:hover:bg-gray-700/60 hover:bg-gray-100/60 transition-colors">
									<div class="text-2xl font-bold mb-1">${this.data.stats.wins}</div>
									<div class="text-xs dark:text-gray-400 text-gray-500">Wins</div>
								</div>
								<div class="dark:bg-gray-700/50 bg-gray-100 rounded-lg p-3 text-center dark:hover:bg-gray-700/60 hover:bg-gray-100/60 transition-colors">
									<div class="text-2xl font-bold text-green-400 mb-1">${this.data.stats.percentage}%</div>
									<div class="text-xs dark:text-gray-400 text-gray-500">Win Rate</div>
								</div>
							</div>
						</div>

						<div class="p-6 pt-0">
							<button id="viewProfile-btn" class="w-full px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-medium rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
								View Profile →
							</button>
						</div>
					</div>

					<!-- Leadernoard Container -->
					<div class="dark:bg-gray-800 bg-white rounded-2xl overflow-hidden border dark:border-gray-700 border-gray-200 flex flex-col h-full transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
						<div class="p-6 flex-1">
							<div class="flex items-center mb-6">
							<div class="size-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mr-4">
								${iconHomeRocket}
							</div>
							<h3 class="text-xl font-bold">Top Player</h3>
							</div>

							<div class="space-y-4 mb-6">
								<div class="flex items-center p-3 dark:bg-gray-700/50 bg-gray-100 rounded-lg transition-colors dark:hover:bg-gray-700/70 hover:bg-gray-100/60">
									<div class="pr-3">
										${iconHomeTrophy}
									</div>
									<div class="flex-1">
										<div class="font-medium">${this.data.topPlayer.name}</div>
										<div class="text-xs dark:text-gray-400 text-gray-500">
											${this.data.topPlayer.wins} wins • ${this.data.topPlayer.matches} matches
										</div>
									</div>
									<div class="flex flex-col items-end">
										<div class="text-lg font-bold text-yellow-400">${this.data.topPlayer.percentage}%</div>
										<div class="text-xs dark:text-gray-400 text-gray-500">win rate</div>
									</div>
								</div>
							</div>
						</div>

						<div class="p-6 pt-0">
							<button id="viewLeaderboard-btn" class="w-full px-4 py-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 font-medium rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
								View Leaderboard →
							</button>
						</div>
					</div>
				</div>
			</div>
		`;
	}

	showErrorState() {
		this.innerHTML = `
		<div class="flex items-center justify-center h-full min-h-screen">
		<h2 class="text-red-500">Failed to load data</h2>
			</div>
		`;
	}
}
