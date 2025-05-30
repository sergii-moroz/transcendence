import {
	iconChevronLeft,
	iconShieldCheck,
	iconUserRound,
} from "../components/icons/icons.js";

import { View } from "../view.js"

export class SettingsView extends View {
	setContent = (profile: Record<string, any>) => {
		this.element.innerHTML = `
			<header
				class="bg-white border border-transparent shadow
					dark:bg-gray-800 dark:border-b-gray-700"
			>
				<div
					class="flex items-center justify-between py-4 px-8 md:px-11 max-w-7xl mx-auto"
				>
					<a href="/home" data-link class="cursor-pointer hover:underline hover:decoration-2 hover:decoration-primary hover:underline-offset-4" >
						<div class="flex gap-2 items-center hover:[&_div]:bg-primary/20 hover:[&_div]:text-primary dark:hover:[&_div]:bg-gray-200 pointer-events-none" data-item-icon>
							<div class="size-8 flex items-center shadow dark:border dark:border-gray-700 justify-center rounded-full">${iconChevronLeft}</div>
							Back
						</div>
					</a>

					<div
						class="flex items-center text-2xl font-bold text-gray-900
						dark:text-white
						sm:max-w-sm sm:text-3xl
						md:max-w-md md:text-4xl"
					>
						<span class="text-2xl mr-2 hidden sm:block sm:text-3xl md:text-4xl">⚙️</span>
						Settings
					</div>
				</div>
			</header>

			<main class="flex flex-col md:flex-row gap-4 p-4 max-w-7xl mx-auto">

				<!-- NAVIGATION MENU -->

				<menu
					class="hidden tw-card p-4 space-y-1 sm:block
						[&_[data-selected]]:text-primary
						dark:[&_[data-selected]]:text-gray-200
						[&_[data-selected]]:font-semibold
						[&_[data-selected]>[data-item-icon]>div]:bg-primary
						[&_[data-selected]>[data-item-icon]>div]:text-gray-200
						[&_[data-selected]:hover>[data-item-icon]>div]:bg-primary/20
						dark:[&_[data-selected]:hover>[data-item-icon]>div]:bg-gray-200
						dark:[&_[data-selected]:hover>[data-item-icon]>div]:text-primary
						[&_[data-selected]:hover>[data-item-icon]>div]:text-primary"
					>
					<ul class="flex md:flex-col">
						<li
							class="md:pl-3 sm:pr-6 py-1 rounded-sm cursor-pointer
								hover:underline hover:decoration-2 hover:decoration-primary hover:underline-offset-4"
							data-menu-item data-selected
						>
							<div class="flex items-center gap-2 lg:text-lg hover:[&_div]:bg-primary/20 hover:[&_div]:text-primary dark:hover:[&_div]:bg-gray-200" data-item-icon>
								<div class="size-8 flex items-center justify-center rounded-full">${iconUserRound}</div>
								General
							</div>
						</li>

						<li
							class="pl-3 pr-6 py-1 rounded-sm cursor-pointer
								hover:underline hover:decoration-2 hover:decoration-primary hover:underline-offset-4"
							data-menu-item
						>
							<div class="flex items-center gap-2 lg:text-lg hover:[&_div]:bg-primary/20 hover:[&_div]:text-primary dark:hover:[&_div]:bg-gray-200" data-item-icon>
								<div class="size-8 flex items-center justify-center rounded-full">${iconShieldCheck}</div>
								Security
							</div>
						</li>
					</ul>
				</menu>

				<!-- CARD: General -->

				<div
					class="tw-card p-4 w-full"
					data-content-block
				>
					<div class="grid grid-cols-2 gap-4">
						<h4 class="sm:text-base md:text-lg">Nickname:</h4>
						<a class="w-full flex items-center lg:text-base">${profile.username}</a>

						<h4 class="sm:text-base md:text-lg">About me:</h4>
						<a class="w-full flex items-center lg:text-base">${profile.bio}</a>
					</div>
				</div>

				<!-- CARD: Security -->

				<div
					class="tw-card p-4 hidden"
					data-content-block
				>
					<div class="grid grid-cols-3 gap-4">
						<h4
							class="col-span-3 font-semibold border border-transparent border-b-gray-200
								dark:border-b-gray-700
								sm:text-lg
								md:text-xl"
						>
								Two factor authentification
						</h4>
						<p class="text-xs text-gray-600 dark:text-gray-300 col-span-3 sm:col-span-2 md:text-sm">
							Two-factor authentication (2FA) is an ehnanced security measure. Once enabled, you'll be required to give two types of identification when you login.
							<span>Google Authenticator</span> is supported.
							<span>SMS</span> and <span>E-mail</span> verification would be added in the near future.
						</p>
						<a href="/settings/2fa/verification-method" data-link class="col-span-3 sm:col-span-1 tw-btn w-full flex items-center justify-center lg:text-base">Enable 2FA</a>

						<h4
							class="col-span-3 font-semibold border border-transparent border-b-gray-200
								dark:border-b-gray-700
								sm:text-lg
								md:text-xl"
						>
							Backup codes
						</h4>
						<p class="text-xs text-gray-600 dark:text-gray-300 col-span-3 sm:col-span-2 md:text-sm">
							Backup codes are an extra set of one-time-use codes that you should keep with you physically.
							You can use one of these when logging in if your other verification methods aren't available.
							Don't worry about using them up, you can generate a new set any time.
						</p>
						<a class="col-span-3 tw-btn sm:col-span-1 break-keep flex items-center justify-center lg:text-base">Generate backup codes</a>

						<h4
							class="col-span-3 font-semibold border border-transparent border-b-gray-200
								dark:border-b-gray-700
								sm:text-lg
								md:text-xl"
						>
							Reset Password
						</h4>
						<p class="text-xs text-gray-600 dark:text-gray-300 col-span-3 sm:col-span-2 md:text-sm">
							For security reasons, we recommend changing your password regularly.
							Choose a strong, unique password that you don't use elsewhere.
						</p>
						<a class="col-span-3 tw-btn sm:col-span-1 break-keep flex items-center justify-center lg:text-base">Reset Password</a>
					</div>
				</div>
			</main>
		`;
	}

	override async prehandler(): Promise<Record<string, any>> {
		const res = await this.api.getProfile();

		return res;
	}

	setupEventListeners() {
		const items = document.querySelectorAll<HTMLElement>('[data-menu-item]')
		const contents = document.querySelectorAll<HTMLElement>('[data-content-block]')

		const updateSelectedItem = (selectedIndex: number) => {
			items.forEach((item, index) => {
				const method = index === selectedIndex ? 'setAttribute' : 'removeAttribute'
				item[method]('data-selected', '')
			})
		}

		const updateContentVisibility = (selectedIndex: number) => {
			contents.forEach((content, index) => {
				content.classList.toggle('hidden', index !== selectedIndex)
			})
		}

		items.forEach((item, index) => {
			this.addEventListener(item, 'click', () => {
				updateSelectedItem(index)
				updateContentVisibility(index)
			})
		})

		const showAllContents = () => {
			contents.forEach(content => content.classList.remove('hidden'))
		}

		const showSelectedContentOnly = () => {
			items.forEach((item, index) => {
				const isSelected = item.hasAttribute('data-selected')
				contents[index]?.classList.toggle('hidden', !isSelected)
			})
		}

		const handleWindowSize = () => {
			const isMobileView = window.innerWidth < 640;

			isMobileView ? showAllContents() : showSelectedContentOnly()
		}

		// show all setting on small device
		this.addEventListener(window, 'resize', handleWindowSize)

		// initialize menu
		handleWindowSize()
	}
}
