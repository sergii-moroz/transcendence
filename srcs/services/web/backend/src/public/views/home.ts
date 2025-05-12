import {
	iconExit,
	iconMail,
	iconSettings
} from "../components/icons.js";

import { View } from "../view.js"

export class HomeView extends View {
	override setContent(input: Record<string, any>) {
		this.element.innerHTML = `
			<header
				class="flex items-center justify-between px-10 py-4
					bg-white shadow relative
					dark:border dark:bg-gray-800 dark:border-gray-700"
			>
				<p>Welcome, ${input.username}</p>
				<div class="text-gray-500">${iconMail}</div>
				<div
					id="avatar"
					class="flex items-center justify-center size-12 rounded-full bg-primary shadow
						text-white uppercase text-bold cursor-pointer
						dark:border-b dark:border-gray-700"
				>
					${input.username.slice(0, 2)}
				</div>

				<!-- MENU: PROFILE -->
				<div
					id="profile-menu"
					class="hidden absolute right-5 top-20 space-y-2"
				>
					<div
						class="h-2 m-2 rounded-sm bg-white shadow dark:border dark:bg-gray-800 dark:border-gray-700"
					></div>
					<ul class="tw-card p-4 space-y-1">
						<li class="pl-3 pr-6 py-1 rounded-sm cursor-pointer hover:underline hover:decoration-2 hover:decoration-primary hover:underline-offset-4">
							<a
								href="/settings"
								class="flex items-center gap-2 hover:[&_div]:bg-primary hover:[&_div]:text-gray-200"
								data-link
							>
								<div class="size-8 flex items-center justify-center rounded-full pointer-events-none">${iconSettings}</div>
								Settings
							</a>
						</li>
						<li id="logout" class="pl-3 pr-6 py-1 rounded-sm cursor-pointer hover:underline hover:decoration-2 hover:decoration-primary hover:underline-offset-4" >
							<div class="flex items-center gap-2 hover:[&_div]:bg-primary hover:[&_div]:text-gray-200">
								<div class="size-8 flex items-center justify-center rounded-full">${iconExit}</div>
								Logout
							<div>
						</li>
					</ul>
				</div>
			</header>

			<nav>
				<a href="/about" data-link>About</a> |
				<a href="/login" data-link>login</a> |
				<a href="/profile" data-link>Profile</a> |
				<button id="join">JoinRoom</button>
			</nav>
		`;
	}

	override async prehandler(): Promise<Record<string, any>> {
		if (this.router.currentUser)
			return { username: this.router.currentUser.username};
		return { username: 'error'};
	}

	setupEventListeners() {
		const avatar = document.getElementById('avatar');
		const profileMenu = document.getElementById('profile-menu')

		const toggleProfileMenu = () => {
			if (!profileMenu) return
			profileMenu.classList.toggle('hidden')
		}

		if (avatar) {
			this.addEventListener(avatar, 'click', toggleProfileMenu);
		}

		this.addEventListener(document.getElementById('logout')!, 'click', async () => {
			await this.api.logout();
			this.router.currentUser = null;
			return this.router.navigateTo('/login');
		});

		this.addEventListener(document.getElementById('join')!, 'click', (e) => {
			e.preventDefault();
			this.router.navigateTo('/waiting-room');
		});
	};
}
