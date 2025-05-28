// import { SidebarResponse } from "../../types/user.js";
// import {
// 	iconHomeProfile,
// 	iconHomeLeaderboard,
// 	iconHomeSingleplayer,
// 	iconHomeTournament,
// 	iconHomeMultiplayer,
// 	iconHomeStats,
// 	iconHomeTrophy,
// 	iconHomeRocket,
// 	iconHomeFriends,
// 	iconHomeRefresh,
// 	iconHomeX,
// 	iconHomePlus,
// 	iconHomeCheck
// } from "../components/icons/icons.js";

// import { View } from "../view.js"

// export class HomeView extends View {
// 	override setContent(input: Record<string, any>) {
// 		this.element.innerHTML = `
// 			<!-- total page -->
// 			<div class="min-h-screen flex overflow-hidden">
// 				<!-- content Part + background modules -->
// 				<div class="flex-1 relative overflow-y-auto">

// 					<!-- background modules -->
// 					<div class="absolute inset-0 overflow-hidden z-0">
// 						<div class="absolute top-5 left-1/8 w-94 h-110 dark:bg-purple-600 bg-green-400 opacity-20 rounded-full blur-3xl"></div>
// 						<div class="absolute bottom-0 right-1/6 w-80 h-80 dark:bg-purple-500 bg-green-400 opacity-15 rounded-full blur-3xl"></div>
// 					</div>

// 					<!-- content part -->
// 					<div class="relative z-10 p-8 max-w-6xl mx-auto">

// 						<!-- header -->
// 						<header class="flex justify-between items-center mb-10">
// 							<h1 class="text-3xl font-bold">TRANSCENDENCE</h1>
// 							<div class="flex items-center gap-3">
// 								<button id="profile-btn" class="p-2 dark:hover:bg-gray-800 hover:bg-gray-200 rounded-full hover:shadow-lg transition-all hover:scale-[1.04]">
// 									${iconHomeProfile}
// 								</button>
// 								<button id="leaderboard-btn" class="p-2 dark:hover:bg-gray-800 hover:bg-gray-200 rounded-full hover:shadow-lg transition-all hover:scale-[1.04]">
// 									${iconHomeLeaderboard}
// 								</button>
// 								<button id="logout-btn" class="ml-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-full hover:shadow-lg transition-all hover:scale-[1.04]">
// 									<span class="text-white">Logout</span>
// 								</button>
// 							</div>
// 						</header>

// 						<!-- boxed section for content -->
//         				<div class="max-w-6xl mx-auto px-4 py-12 space-y-12">

// 							<!-- grid for the 3 play container -->
// 				            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">

//               					<!-- Singleplayer Card -->
// 								<div class="dark:bg-gray-800 bg-white rounded-2xl overflow-hidden border dark:border-gray-700 border-gray-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
// 									<div class="p-6">
// 									<div class="w-16 h-16 rounded-lg bg-green-500/10 flex items-center justify-center mb-6">
// 										${iconHomeSingleplayer}
// 									</div>
// 									<h3 class="text-xl font-bold mb-3">Singleplayer</h3>
// 									<p class="dark:text-gray-400 text-gray-500 mb-6">Play by yourself against our intelligent AI opponent</p>
// 									<button id="singleplayer-btn" class="px-6 py-3 bg-green-500 rounded-lg text-white font-medium hover:shadow-lg transition-all hover:scale-[1.04]">
// 										Play vs AI
// 									</button>
// 									</div>
// 								</div>

// 								<!-- Multiplayer Card -->
// 								<div class="dark:bg-gray-800 bg-white rounded-2xl overflow-hidden border dark:border-gray-700 border-gray-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
// 									<div class="p-6">
// 									<div class="w-16 h-16 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6">
// 										${iconHomeMultiplayer}
// 									</div>
// 									<h3 class="text-xl font-bold mb-3">Multiplayer</h3>
// 									<p class="dark:text-gray-400 text-gray-500 mb-6">Real-time 1v1 matches with random matchmaking</p>
// 									<button id="multiplayer-btn" class="px-6 py-3 bg-blue-500 rounded-lg text-white font-medium hover:shadow-lg transition-all hover:scale-[1.04]">
// 										Play 1v1
// 									</button>
// 									</div>
// 								</div>

// 								<!-- Tournament Card -->
// 								<div class="dark:bg-gray-800 bg-white rounded-2xl overflow-hidden border dark:border-gray-700 border-gray-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
// 									<div class="p-6">
// 									<div class="w-16 h-16 rounded-lg bg-purple-500/10 flex items-center justify-center mb-6">
// 										${iconHomeTournament}
// 									</div>
// 									<h3 class="text-xl font-bold mb-3">Tournament</h3>
// 									<p class="dark:text-gray-400 text-gray-500 mb-6">Compete in elimination brackets with 4 players</p>
// 									<button id="tournament-btn" class="px-6 py-3 bg-purple-500 rounded-lg text-white font-medium hover:shadow-lg transition-all hover:scale-[1.04]">
// 										Join Tournament
// 									</button>
// 									</div>
// 								</div>
// 							</div>

// 							<!-- Stats and Leaderboard Section -->
// 							<div class="grid grid-cols-1 md:grid-cols-2 gap-8">

// 								<!-- Your Stats container -->
// 								<div class="dark:bg-gray-800 bg-white rounded-2xl overflow-hidden border dark:border-gray-700 border-gray-200 flex flex-col h-full transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
// 									<div class="p-6 flex-1">
// 										<div class="flex items-center mb-6">
// 											<div class="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center mr-4">
// 												${iconHomeStats}
// 											</div>
// 											<h3 class="text-xl font-bold text-white">Your Stats</h3>
// 										</div>

// 										<div class="grid grid-cols-3 gap-4 mb-6">
// 											<div class="dark:bg-gray-700/50 bg-gray-100 rounded-lg p-3 text-center dark:hover:bg-gray-700/60 hover:bg-gray-100/60 transition-colors">
// 												<div class="text-2xl font-bold mb-1">${input.stats.matches}</div>
// 												<div class="text-xs dark:text-gray-400 text-gray-500">Matches</div>
// 											</div>
// 											<div class="dark:bg-gray-700/50 bg-gray-100 rounded-lg p-3 text-center dark:hover:bg-gray-700/60 hover:bg-gray-100/60 transition-colors">
// 												<div class="text-2xl font-bold mb-1">${input.stats.wins}</div>
// 												<div class="text-xs dark:text-gray-400 text-gray-500">Wins</div>
// 											</div>
// 											<div class="dark:bg-gray-700/50 bg-gray-100 rounded-lg p-3 text-center dark:hover:bg-gray-700/60 hover:bg-gray-100/60 transition-colors">
// 												<div class="text-2xl font-bold text-green-400 mb-1">${input.stats.percentage}%</div>
// 												<div class="text-xs dark:text-gray-400 text-gray-500">Win Rate</div>
// 											</div>
// 										</div>
// 									</div>

// 									<div class="p-6 pt-0">
// 										<button id="viewProfile-btn" class="w-full px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-medium rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
// 											View Profile →
// 										</button>
// 									</div>
// 								</div>

// 								<!-- Leadernoard Container -->
// 								<div class="dark:bg-gray-800 bg-white rounded-2xl overflow-hidden border dark:border-gray-700 border-gray-200 flex flex-col h-full transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
// 									<div class="p-6 flex-1">
// 										<div class="flex items-center mb-6">
// 										<div class="size-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mr-4">
// 											${iconHomeRocket}
// 										</div>
// 										<h3 class="text-xl font-bold">Top Player</h3>
// 										</div>

// 										<div class="space-y-4 mb-6">
// 											<div class="flex items-center p-3 dark:bg-gray-700/50 bg-gray-100 rounded-lg transition-colors dark:hover:bg-gray-700/70 hover:bg-gray-100/60">
// 												<div class="pr-3">
// 													${iconHomeTrophy}
// 												</div>
// 												<div class="flex-1">
// 													<div class="font-medium">${input.topPlayer.name}</div>
// 													<div class="text-xs dark:text-gray-400 text-gray-500">
// 														${input.topPlayer.wins} wins • ${input.topPlayer.matches} matches
// 													</div>
// 												</div>
// 												<div class="flex flex-col items-end">
// 													<div class="text-lg font-bold text-yellow-400">${input.topPlayer.percentage}%</div>
// 													<div class="text-xs dark:text-gray-400 text-gray-500">win rate</div>
// 												</div>
// 											</div>
// 										</div>
// 									</div>

// 									<div class="p-6 pt-0">
// 										<button id="viewLeaderboard-btn" class="w-full px-4 py-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 font-medium rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
// 											View Leaderboard →
// 										</button>
// 									</div>
// 								</div>
// 							</div>
// 						</div>
// 					</div>
// 				</div>

// 				<!-- SideBar collapsed -->
// 				    <div id="sideBar-collapsed" class="w-16 h-dvh fixed right-0 dark:bg-gray-800 bg-white border-l dark:border-gray-700 border-gray-200 flex flex-col items-center py-6 cursor-pointer dark:hover:bg-gray-700/50 hover:bg-white/70 transition-colors">
// 						<div class="mb-6">
// 							${iconHomeFriends}
// 						</div>
// 						<div class="w-10 h-10 dark:bg-gray-700 bg-gray-100 rounded-full mb-3 relative">
// 							<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 dark:border-gray-800 border-white"></div>
// 						</div>
// 						<div class="w-10 h-10 dark:bg-gray-700 bg-gray-100 rounded-full mb-3 relative">
// 							<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 dark:border-gray-800 border-white"></div>
// 						</div>
// 						<div class="w-10 h-10 dark:bg-gray-700 bg-gray-100 rounded-full mb-3 relative">
// 							<div class="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 dark:border-gray-800 border-white"></div>
// 						</div>
// 						<div class="mt-auto">
// 							<div class="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
// 								${input.friendAmount}
// 							</div>
// 						</div>
// 						<div class="mt-3 text-xs text-gray-400 [writing-mode:vertical-rl] [text-orientation:mixed] rotate-180">
// 							FRIENDS
// 						</div>
// 					</div>

// 				<!-- Social Sidebar - Friends List -->
// 				<div id="sidebar-friends" class="w-80 h-screen dark:bg-gray-800 bg-white border-l dark:border-gray-700 border-gray-200 flex flex-col">
// 					<div class="p-4 flex justify-between items-center">
// 						<h2 class="text-lg font-bold flex items-center">
// 							<span class="mr-2">${iconHomeFriends}</span>
// 							Friends
// 						</h2>
// 						<div class="flex items-center gap-2">
// 							<button id="refresh-friends-btn" class="text-gray-400 dark:hover:text-white hover:text-gray-500  p-1" title="Refresh Friends">
// 								${iconHomeRefresh}
// 							</button>
// 							<button id="close-social-btn" class="text-gray-400 dark:hover:text-white hover:text-gray-500 p-1">
// 								${iconHomeX}
// 							</button>
// 						</div>
// 					</div>

// 					<!-- Add friend -->
// 					<div class="p-4 border-b border-t dark:border-gray-700 border-gray-100">
// 						<div class="relative">
// 						<input id="addFriendInput" type="text" placeholder="Add friend..." class="w-full dark:bg-gray-700 bg-gray-100 border-none rounded-lg pl-3 pr-10 py-2 text-sm placeholder-gray-400 focus:ring-blue-500 focus:ring-2 duration-300 hover:scale-[1.02] hover:shadow-lgmake">
// 						<button id="addFriendBTN" class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:hover:text-white hover:text-gray-500">
// 							${iconHomePlus}
// 						</button>
// 						</div>
// 					</div>

// 					<!-- Content Container -->
//   					<div class="flex flex-col h-full overflow-y-auto">
// 						<div id="friendInvite" class="flex-shrink-0"></div>
// 						<div id="friendList" class="flex-shrink-0"></div>
// 					</div>
// 				</div>

// 			</div>
// 		`;
// 	}

// 	override async prehandler(): Promise<Record<string, any> | null> {
// 		const input = await this.api.getHome();
// 		return input;
// 	}

// 	setupEventListeners() {
// 		const profileBTN = document.getElementById('profile-btn');
// 		const leaderboardBTN = document.getElementById('leaderboard-btn');
// 		const logoutBTN = document.getElementById('logout-btn');
// 		const singleplayerBTN = document.getElementById('singleplayer-btn');
// 		const multiplayerBTN = document.getElementById('multiplayer-btn');
// 		const tournamentBTN = document.getElementById('tournament-btn');
// 		const viewProfileBTN = document.getElementById('viewProfile-btn');
// 		const viewLeaderboardBTN = document.getElementById('viewLeaderboard-btn');

// 		const sideBar_collapsed = document.getElementById('sideBar-collapsed');
// 		const sideBar_friends = document.getElementById('sidebar-friends');
// 		const sideBar_close_BTN = document.getElementById('close-social-btn');
// 		const sideBar_refreshBTN = document.getElementById('refresh-friends-btn');
// 		const addFriend = document.getElementById('addFriendBTN');
// 		const input = document.getElementById('addFriendInput') as HTMLInputElement;

// 		this.addEventListener(profileBTN!, 'click', () => {
// 			return this.router.navigateTo('/settings');
// 		});

// 		this.addEventListener(leaderboardBTN!, 'click', () => {
// 			return this.router.navigateTo('/about');
// 		});

// 		this.addEventListener(logoutBTN!, 'click', async () => {
// 			await this.api.logout();
// 			this.router.currentUser = null;
// 			return this.router.navigateTo('/login');
// 		});

// 		this.addEventListener(singleplayerBTN!, 'click', () => {
// 			alert('not available');
// 		});

// 		this.addEventListener(multiplayerBTN!, 'click', () => {
// 			return this.router.navigateTo('/waiting-room');
// 		});

// 		this.addEventListener(tournamentBTN!, 'click', () => {
// 			return this.router.navigateTo('/tournament-waiting-room');
// 		});

// 		this.addEventListener(viewProfileBTN!, 'click', () => {
// 			return this.router.navigateTo('/settings');
// 		});

// 		this.addEventListener(viewLeaderboardBTN!, 'click', () => {
// 			return this.router.navigateTo('/about');
// 		});

// 		function show(el: HTMLElement) {
// 			el.classList.remove('hidden');
// 			el.classList.add('flex', 'flex-col');
// 		}

// 		function hide(el: HTMLElement) {
// 			el.classList.remove('flex', 'flex-col');
// 			el.classList.add('hidden');
// 		}


// 		// sidebar
// 		hide(sideBar_friends!);
// 		this.addEventListener(sideBar_collapsed!, 'click', () => {
// 			hide(sideBar_collapsed!);
// 			show(sideBar_friends!);

// 			this.populateSidebar();
// 		})

// 		this.addEventListener(sideBar_close_BTN!, 'click', () => {
// 			hide(sideBar_friends!);
// 			show(sideBar_collapsed!);
// 		})

// 		this.addEventListener(sideBar_refreshBTN!, 'click', () => {
// 			alert('nothing yet');
// 			this.populateSidebar();
// 		})

// 		this.addEventListener(addFriend!, 'click', () => {
// 			const name = input!.value.trim();
// 			if (name) {
// 				console.log(name);
// 				input.value = '';
// 			}
// 		})

// 		this.addEventListener(input, "keydown", (event) => {
// 			if (event instanceof KeyboardEvent && event.key === 'Enter') {
// 				const name = input!.value.trim();
// 				if (name) {
// 					console.log(name);
// 					input.value = '';
// 				}
// 			}
// 		})

// 	};

// 	async populateSidebar() {
// 		const root = document.getElementById('friendInvite');
// 		root!.innerHTML = '';
// 		const data = await this.api.getSidebar() as SidebarResponse;
// 		if (!data) return;

// 		this.addRequests(data, root!);
// 		this.addFriends(data, root!);
// 	}

// 	addRequests(data: SidebarResponse, root: HTMLElement) {
// 		if (data.FriendRequests.length > 0) {
// 			const element = document.createElement('div');
// 			element.innerHTML = `
// 				<div class="p-4 border-b dark:border-gray-700 border-gray-200">
// 					<h3 class="font-bold text-lg mb-3 pb-2">
// 						Friend  Requests
// 					</h3>
// 					<div id="insertContainer" class="space-y-3"></div>
// 				</div>
// 			`;

// 			const requestsContainer = element.querySelector('#insertContainer');

// 			for (let i = 0; i < data.FriendRequests.length; i++) {
// 				const requestElement = document.createElement('div');
// 				requestElement.className = 'dark:bg-gray-700 bg-gray-100 rounded-3xl shadow-sm p-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg';
// 				requestElement.innerHTML = `
// 					<div class="flex items-center justify-between">
// 						<div class="flex items-center gap-2"> <!-- Added wrapper div with gap control -->
// 							<img
// 								src="${data.FriendRequests[i].picture}"
// 								onerror="this.src='../uploads/default.jpg'"
// 								class="w-10 h-10 rounded-full object-cover"
// 							>
// 							<span class="font-medium">${data.FriendRequests[i].name}</span>
// 						</div>
// 						<div class="flex gap-2">
// 							<button class="p-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors">
// 								${iconHomeCheck}
// 							</button>
// 							<button class="p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors">
// 								${iconHomeX}
// 							</button>
// 						</div>
// 					</div>
// 				`;
// 				requestsContainer!.appendChild(requestElement);
// 			}
// 			root.append(element);
// 		}
// 	}

// 	addFriends(data: SidebarResponse, root: HTMLElement) {
// 		const online = document.createElement('div');
// 		online.innerHTML = `
// 			<div class="p-4 border-b dark:border-gray-700 border-gray-200">
// 				<h3 class="text-xs font-bold text-gray-400 mb-3">ONLINE • ${data.friends.online.length}</h3>
// 				<div id="insertContainer" class="space-y-2"></div>
// 			</div>
// 		`;

// 		if (data.friends.online.length > 0)
// 		{
// 			const requestsContainer = online.querySelector('#insertContainer');

// 			for (let i = 0; i < data.friends.online.length; i++) {
// 				const requestElement = document.createElement('div');
// 				requestElement.className = "friend-item flex items-center p-2 rounded-lg dark:hover:bg-gray-700 hover:bg-gray-100 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg";
// 				requestElement.innerHTML = `
// 						<div class="relative mr-3">
// 							<img
// 								src=${data.friends.online[i].picture}
// 								onerror="this.src='../uploads/default.jpg'"
// 								class="w-10 h-10 rounded-full"
// 							>
// 							<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 dark:border-gray-800 border-white"></div>
// 						</div>
// 						<span class="font-medium">${data.friends.online[i].name}</span>
// 				`;
// 				requestsContainer!.appendChild(requestElement);
// 			}
// 		}
// 		root.append(online);


// 		const offline = document.createElement('div');
// 		offline.innerHTML = `
// 			<div class="p-4">
// 				<h3 class="text-xs font-bold text-gray-400 mb-3">OFFLINE • ${data.friends.offline.length}</h3>
// 				<div id="insertContainer" class="space-y-2"></div>
// 			</div>
// 		`;

// 		if (data.friends.offline.length > 0)
// 		{
// 			const requestsContainer = offline.querySelector('#insertContainer');

// 			for (let i = 0; i < data.friends.offline.length; i++) {
// 				const requestElement = document.createElement('div');
// 				requestElement.className = "friend-item flex items-center p-2 rounded-lg dark:hover:bg-gray-700 hover:bg-gray-100 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg";
// 				requestElement.innerHTML = `
// 						<div class="relative mr-3">
// 							<img
// 								src=${data.friends.offline[i].picture}
// 								onerror="this.src='../uploads/default.jpg'"
// 								class="w-10 h-10 rounded-full"
// 							>
// 							<div class="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 dark:border-gray-800 border-white"></div>
// 						</div>
// 						<span class="font-medium">${data.friends.offline[i].name}</span>
// 				`;
// 				requestsContainer!.appendChild(requestElement);
// 			}
// 		}
// 		root.append(offline);
// 	}
// }
