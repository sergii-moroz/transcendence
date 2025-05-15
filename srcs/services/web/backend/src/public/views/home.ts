import {
	iconHomeProfile,
	iconHomeLeaderboard,
	iconHomeSingleplayer,
	iconHomeTournament,
	iconHomeMultiplayer
} from "../components/icons.js";

import { View } from "../view.js"

export class HomeView extends View {
	override setContent(input: Record<string, any>) {
		this.element.innerHTML = `
			<!-- total page -->
			<div class="min-h-screen flex overflow-hidden">
				<!-- content Part + background modules -->
				<div class="flex-1 relative overflow-y-auto">
					
					<!-- background modules -->
					<div class="absolute inset-0 overflow-hidden z-0">
						<div class="absolute top-5 left-1/8 w-94 h-110 dark:bg-purple-600 bg-green-400 opacity-20 rounded-full blur-3xl"></div>
						<div class="absolute bottom-0 right-1/6 w-80 h-80 dark:bg-purple-500 bg-green-400 opacity-15 rounded-full blur-3xl"></div>
					</div>

					<!-- content part -->
					<div class="relative z-10 p-8 max-w-6xl mx-auto">

						<!-- header -->
						<header class="flex justify-between items-center mb-10">
							<h1 class="text-3xl font-bold">TRANSCENDENCE</h1>
							<div class="flex items-center gap-3">
								<button id="profile-btn" class="p-2 dark:hover:bg-gray-800 hover:bg-gray-200 rounded-full hover:shadow-lg transition-all hover:scale-[1.04]">
									${iconHomeProfile}
								</button>
								<button id="leaderboard-btn" class="p-2 dark:hover:bg-gray-800 hover:bg-gray-200 rounded-full hover:shadow-lg transition-all hover:scale-[1.04]">
									${iconHomeLeaderboard}
								</button>
								<button id="logout-btn" class="ml-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-full hover:shadow-lg transition-all hover:scale-[1.04]">
									<span class="text-white">Logout</span>
								</button>
							</div>
						</header>

						<!-- boxed section for content -->
        				<div class="max-w-6xl mx-auto px-4 py-12 space-y-12">

							<!-- grid for the 3 play container -->
				            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">

              					<!-- Singleplayer Card -->
								<div class="dark:bg-gray-800 bg-white rounded-2xl overflow-hidden border dark:border-gray-700 border-gray-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
									<div class="p-6">
									<div class="w-16 h-16 rounded-lg bg-green-500/10 flex items-center justify-center mb-6">
										${iconHomeSingleplayer}
									</div>
									<h3 class="text-xl font-bold mb-3">Singleplayer</h3>
									<p class="dark:text-gray-400 text-gray-500 mb-6">Play by yourself against our intelligent AI opponent</p>
									<button id="singleplayer-btn" class="px-6 py-3 bg-green-500 rounded-lg text-white font-medium hover:shadow-lg transition-all hover:scale-[1.04]">
										Play vs AI
									</button>
									</div>
								</div>
							
								<!-- Multiplayer Card -->
								<div class="dark:bg-gray-800 bg-white rounded-2xl overflow-hidden border dark:border-gray-700 border-gray-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
									<div class="p-6">
									<div class="w-16 h-16 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6">
										${iconHomeMultiplayer}
									</div>
									<h3 class="text-xl font-bold mb-3">Multiplayer</h3>
									<p class="dark:text-gray-400 text-gray-500 mb-6">Real-time 1v1 matches with random matchmaking</p>
									<button id="multiplayer-btn" class="px-6 py-3 bg-blue-500 rounded-lg text-white font-medium hover:shadow-lg transition-all hover:scale-[1.04]">
										Play 1v1
									</button>
									</div>
								</div>
							
								<!-- Tournament Card -->
								<div class="dark:bg-gray-800 bg-white rounded-2xl overflow-hidden border dark:border-gray-700 border-gray-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
									<div class="p-6">
									<div class="w-16 h-16 rounded-lg bg-purple-500/10 flex items-center justify-center mb-6">
										${iconHomeTournament}
									</div>
									<h3 class="text-xl font-bold mb-3">Tournament</h3>
									<p class="dark:text-gray-400 text-gray-500 mb-6">Compete in elimination brackets with 4 players</p>
									<button id="tournament-btn" class="px-6 py-3 bg-purple-500 rounded-lg text-white font-medium hover:shadow-lg transition-all hover:scale-[1.04]">
										Join Tournament
									</button>
									</div>
								</div>							
							</div>
						</div>
						
					</div>
				</div>
			</div>
		`;
	}

	// override async prehandler(): Promise<Record<string, any>> {
	// 	if (this.router.currentUser)
	// 		return { username: this.router.currentUser.username};
	// 	return { username: 'error'};
	// }

	setupEventListeners() {
		const profileBTN = document.getElementById('profile-btn');
		const leaderboardBTN = document.getElementById('leaderboard-btn');
		const logoutBTN = document.getElementById('logout-btn');
		const singleplayerBTN = document.getElementById('singleplayer-btn');
		const multiplayerBTN = document.getElementById('multiplayer-btn');
		const tournamentBTN = document.getElementById('tournament-btn');

		this.addEventListener(profileBTN!, 'click', () => {
			return this.router.navigateTo('/profile');
		});

		this.addEventListener(leaderboardBTN!, 'click', () => {
			return this.router.navigateTo('/about');
		});

		this.addEventListener(logoutBTN!, 'click', async () => {
			await this.api.logout();
			this.router.currentUser = null;
			return this.router.navigateTo('/login');
		});

		this.addEventListener(singleplayerBTN!, 'click', () => {
			alert('not available');
		});

		this.addEventListener(multiplayerBTN!, 'click', () => {
			return this.router.navigateTo('/waiting-room');
		});

		this.addEventListener(tournamentBTN!, 'click', () => {
			alert('not available');
		});
	};
}
