import {
	iconHomeProfile,
	iconHomeLeaderboard
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
								<button id="profile-btn" class="p-2 dark:hover:bg-gray-800 hover:bg-gray-200 rounded-full transition-colors">
									${iconHomeProfile}
								</button>
								<button id="leaderboard-btn" class="p-2 dark:hover:bg-gray-800 hover:bg-gray-200 rounded-full transition-colors">
									${iconHomeLeaderboard}
								</button>
								<button id="logout-btn" class="ml-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors">
									<span class="text-white">Logout</span>
								</button>
							</div>
						</header>

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
	};
}
