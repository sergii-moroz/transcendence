import { API } from "../../api-static.js";
import { Router } from "../../router-static.js"

import {
	iconHomeProfile,
	iconHomeLeaderboard,
} from "../icons/icons.js"

export class HomeHeader extends HTMLElement {

	constructor() {
		super()
	}

	connectedCallback() {
		this.render();
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
			Router.navigateTo('/about');
		}
		else if (target.closest('#logout-btn')) {
			// await API.logout();
			// Router.currentUser = null;
			Router.navigateTo('/login');
		}
	}

	render() {
		this.innerHTML = `
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
		`;
	}
}
