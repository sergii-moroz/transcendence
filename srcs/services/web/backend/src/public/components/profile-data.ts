import { iconHomeStats } from "./icons/icons.js"

export class ProfileData extends HTMLElement {
	
	constructor() {
		super()
		this.render();
	}

	async connectedCallback() {

	}

	disconnectedCallback() {
	}

	handleEvent(event: Event) {
	}

	private render() {
		this.innerHTML = `
			<div class="tw-card p-6">
				<div class="flex items-center mb-6">
					<div class="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center mr-4">
						${iconHomeStats}
					</div>
					<h3 class="text-xl font-bold">Profile Data</h3>
				</div>

				<div class="flex p-4 space-x-6">
					<div class="flex flex-col">
						<div class="relative">
							<div class="size-40 overflow-hidden rounded-full border-4 border-white dark:border-gray-300 bg-gray-200 shadow-lg">
								<img src="https://tsavotrust.org/wp-content/uploads/2024/12/Are-elephants-dangerous-to-humans-scaled.jpg" alt="Profile" class="h-full w-full object-cover" />
							</div>
							<div class="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
							</div>
							<div class="absolute bottom-3 right-3 size-5 bg-green-500 border-3 border-white dark:border-gray-300 rounded-full"></div>
						</div>
					</div>

					<div class="flex flex-col space-y-4">
						<div class="space-y-0.5">
							<label class="block whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">Username</label>
							<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 lowercase">Tecker</h2>
						</div>

						<div class="space-y-0.5">
							<label class="block whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">Favorite Animal</label>
							<div class="flex">
								<p class="text-gray-700 dark:text-gray-200">Elephant</p>
								<button class="ml-2 text-gray-400 dark:text-gray-500 hover:text-blue-500">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
								</svg>
								</button>
							</div>
						</div>

						<div class="space-y-0.5">
							<label class="block whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">Registered Since</label>
							<p class="flex items-center text-gray-700 dark:text-gray-100 whitespace-nowrap">
								<svg class="mr-2 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
								03 June 2023
							</p>
						</div>
					</div> 
				</div>

				<div class='pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3'>
					<button class="flex items-center justify-center rounded-lg whitespace-nowrap bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2 text-blue-600 dark:text-blue-300  transition-colors w-full">
						<svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
						Change Password
					</button>
					<button class="flex items-center justify-center rounded-lg whitespace-nowrap bg-green-500/10 hover:bg-green-500/20 px-4 py-2 text-green-600 dark:text-green-300 transition-colors w-full">
						<svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
						</svg>
						Enable 2FA
					</button>
				</div> 
			</div>
		`
	}
}
