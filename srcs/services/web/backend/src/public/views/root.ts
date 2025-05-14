import { View } from "../view.js"

export class RootView extends View {
	setContent = () => {
		this.element.innerHTML = `
			<header
				class="flex items-center justify-between p-4 sm:px-8"
			>
				<div
					class="flex items-center w-full text-2xl font-bold text-gray-900
					dark:text-white
					sm:max-w-sm sm:text-3xl
					md:max-w-md md:text-4xl"
				>
					<span class="text-2xl mr-2 hidden sm:block sm:text-3xl md:text-4xl">🏓</span>
					ft_transcendence
				</div>

				<div class="hidden sm:flex gap-4">
					<a
						href="/register"
						data-link
						class="tw-btn-outline w-30"
					>
						Sign up
					</a>

					<a
						href="/login"
						data-link
						class="tw-btn w-30"
					>
						Sign in
					</a>
				</div>

				<!-- Mobile Hamburger -->
				<button
					id="menu-toggle"
					class="text-xl p-2 text-primary bg-white rounded-sm shadow cursor-pointer
					hover:bg-white/70
					sm:hidden
					dark:border dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:text-dark-primary dark:hover:bg-gray-800/70"
				>
					☰
				</button>
			</header>

			<div class=container>
				<main class="h-64 bg-primary/20 flex flex-col items-center justify-center">

					<div class="mb-4 dark:text-gray-50">
						<h1 class="text-3xl font-bold mb-4">CTA Hero<h1>
						<span >Bla-bla-pong!<span>
					</div>

					<div class="flex gap-4">
						<a href="/register" data-link class="tw-btn w-30">
							Try it
						</a>

				</main>
			<div>

			<!-- Mobile Menu Modal -->
			<div
				id="mobile-menu"
				class="fixed inset-0 bg-black/50  backdrop-blur-sm hidden items-center z-50 flex flex-col pt-20 sm:hidden
				"
			>
				<div class="tw-card text-center p-6 w-80 space-y-4 relative">
					<button id="menu-close" class="absolute top-2 right-2 text-xl text-gray-700 dark:text-gray-300">
						✕
					</button>
					<h2 class="text-xl font-bold mb-4 dark:text-white">Welcome</h2>
					<a href="/login" data-link class="tw-btn block w-full">Sign in</a>
					<a href="/register" data-link class="tw-btn-outline block w-full">Sign up</a>
				</div>
			</div>
		`;
	}

	setupEventListeners() {
		const toggleBtn = document.getElementById('menu-toggle');
		const closeBtn = document.getElementById('menu-close');
		const menu = document.getElementById('mobile-menu');

		const toggleBtnHandler = () => {
			menu!.classList.remove('hidden');
			// menu.classList.add('flex');
		};

		const closeBtnHandler = () => {
			menu!.classList.add('hidden');
			// menu.classList.remove('flex');
		};

		this.addEventListener(toggleBtn!, 'click', toggleBtnHandler);
		this.addEventListener(closeBtn!, 'click', closeBtnHandler);
	}
}
