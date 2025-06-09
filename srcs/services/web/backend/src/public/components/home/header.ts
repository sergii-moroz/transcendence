import { Router } from "../../router-static.js"

import {
	iconHomeProfile,
	iconHomeLeaderboard,
	iconPower,
	iconFriends,
} from "../icons/icons.js"

export class HomeHeader extends HTMLElement {

	constructor() {
		super()
		this.render()
	}

	connectedCallback() {
		this.addEventListener('click', this.handleClick);
	}

	disconnectedCallback() {
		this.removeEventListener('click', this.handleClick);
	}

	async handleClick(event: Event) {
		const target = event.target as HTMLElement;

		if (target.closest('#profile-btn')) {
			Router.navigateTo('/settings');
		}
		else if (target.closest('#leaderboard-btn')) {
			Router.navigateTo('/leaderboard');
		}
		else if (target.closest('#logout-btn')) {
			Router.logout();
		}
		else if (target.closest("#sidebarToggle")) {
			window.dispatchEvent(new CustomEvent('open-sidebar', {
				detail: {state: 'friendList'}
			}))
		}
	}

	render() {
		this.innerHTML = `
			<header class="flex justify-between items-center p-4 sm:p-8">
				<h1 class="text-xl sm:text-3xl font-bold">TRANSCENDENCE</h1>
				<div class="flex items-center gap-1 sm:gap-2 md:gap-3">
					<button id="profile-btn" class="p-2 [&>svg]:size-5 sm:[&>svg]:size-6 dark:hover:bg-gray-800 hover:bg-gray-200 rounded-full hover:shadow-lg transition-all hover:scale-[1.04]">
						${iconHomeProfile}
					</button>
					<button id="leaderboard-btn" class="p-2 [&>svg]:size-5 sm:[&>svg]:size-6 dark:hover:bg-gray-800 hover:bg-gray-200 rounded-full hover:shadow-lg transition-all hover:scale-[1.04]">
						${iconHomeLeaderboard}
					</button>
					<button id="logout-btn" class="p-2 md:px-4 bg-red-500 hover:bg-red-600 rounded-full hover:shadow-lg transition-all hover:scale-[1.04]">
						<span class="md:hidden text-white [&>svg]:size-5 sm:[&>svg]:size-6">${iconPower}</span>
						<span class="hidden text-white md:inline-block">Logout</span>
					</button>
					<button id="sidebarToggle" class="p-2 lg:hidden [&>svg]:size-5 sm:[&>svg]:size-6 text-blue-400 dark:text-white rounded-full border border-gray-200 bg-white hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
						${iconFriends}
					</button>
				</div>
			</header>
		`;
	}
}
