import {
	iconCheck,
	iconChevronLeft,
} from "../components/icons.js";
import { generateBackupCodesImage } from "../utils/utils.js";

import { View } from "../view.js"

export class Backup2FAView extends View {
	setContent = () => {

		this.element.innerHTML = `
			<header
				class="bg-white border border-transparent shadow
					dark:bg-gray-800 dark:border-b-gray-700"
			>
				<div
					class="flex items-center justify-between py-4 px-8 md:px-11 max-w-7xl mx-auto"
				>
					<a href="/settings" data-link class="cursor-pointer hover:underline hover:decoration-2 hover:decoration-primary hover:underline-offset-4" >
						<div class="flex gap-2 items-center hover:[&_div]:bg-primary/20 hover:[&_div]:text-primary dark:hover:[&_div]:bg-gray-200 pointer-events-none" data-item-icon>
							<div class="size-8 flex items-center shadow dark:border dark:border-gray-700 justify-center rounded-full">${iconChevronLeft}</div>
							Back
						</div>
					</a>

					<div
						class="flex items-center font-bold text-gray-900
						dark:text-white
						sm:max-w-sm sm:text-lg
						md:max-w-md md:text-xl"
					>
						<span class="text-2xl mr-2 hidden sm:block sm:text-3xl md:text-4xl">🔒</span>
						<div>
							<div>Two-Factor</div>
							<div>Authentification</div>
						</div>
					</div>
				</div>
			</header>


			<section>
				<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto space-y-4">

					<!-- State -->
					<div class="flex items-center justify-between w-full px-6 pb-6 text-xs md:text-sm
												sm:max-w-sm
												md:max-w-md">

						<div class="relative w-5 h-5 rounded-full border border-primary bg-primary">
							<span class="[&_svg]:size-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-200">${iconCheck}</span>
							<span class="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-primary dark:text-gray-200">Register</span>
						</div>

						<div class="h-px flex-grow bg-primary dark:bg-gray-700 mx-2"></div>

						<div class="relative w-5 h-5 rounded-full border border-primary bg-primary">
							<span class="[&_svg]:size-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-200">${iconCheck}</span>
							<span class="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-primary dark:text-gray-200">Verify</span>
						</div>

						<div class="h-px flex-grow bg-primary dark:bg-gray-700 mx-2"></div>

						<div class="relative w-5 h-5 rounded-full border-2 border-primary">
							<span class="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-primary dark:text-gray-200">Backup</span>
						</div>

					</div>

					<!-- CARD -->
					<div class="tw-card w-full p-4 space-y-4
												sm:max-w-sm sm:p-6 sm:space-y-6
												md:max-w-md"
					>

						<!-- CARD: HEADER -->
						<h1 class="text-xl text-center font-bold text-gray-700 md:text-2xl dark:text-gray-200">
								Backup verification codes
						</h1>

						<!-- CARD: CONTENT -->
						<div
							class="text-xs md:text-sm p-4 space-y-4 text-center
											border border-transparent border-y-gray-200
											sm:p-6
											md:space-y-6
											dark:border-y-gray-700"
						>
							<p>
								With 2FA enabled for your account, you'll need these backup codes if you ever lose your device.
								Without your device or backup code, you'll have to contact support team to recover your account.
							</p>
							<p>We recommend you to print them to keep in a safe place.</p>
							<div
								id="codes"
								class="grid grid-cols-2 gap-4 bg-gray-500/10 text-xs text-gray-600 px-4 py-2 rounded-sm
									border border-gray-200 dark:text-gray-200 dark:border-gray-700"
							>
								CODES HERE
							</div>

							<div>
								<button id="btn-print" class="tw-btn-outline">Print</button>
								<button id="btn-download" class="tw-btn-outline">Download (PDF)</button>
							</div>
						</div>

						<!-- CARD: FOOTER -->
						<div class="flex items-center justify-between">
							<a href="/settings" data-link class="tw-btn-outline w-24">Cancel</a>
							<button id="btn-next" class="tw-btn-disabled w-24" disabled>Next</button>
						</div>
					</div>
				</div>
			</section>
		`;
	}

	async setupEventListeners() {
		const Enabledguard = async () => {
			const res = await this.api.is2FAEnabled();

			const data = await res.json()
			console.log("DATA:", data)
			if (res.ok && data.enabled) {
				this.router.navigateTo('/settings/2fa/is-already-enabled')
				return true
			}
			return false
		}

		if (await Enabledguard()){
			return
		}

		let backupCodes: string[];

		const btnNext = document.getElementById('btn-next') as HTMLButtonElement
		const btnPrint = document.getElementById('btn-print') as HTMLButtonElement
		const btnDownload = document.getElementById('btn-download') as HTMLButtonElement
		const codesContainer = document.getElementById('codes') as HTMLElement

		const loadBackupCodes = async () => {
			const res = await this.api.create2FABackupCodes()
			const data = await res.json()
			backupCodes = data.codes
			codesContainer.innerHTML = backupCodes.map(code => `<p>${code}</p>`).join('')
		}

		const enableNext = () => {
			btnNext.disabled = false
			btnNext.classList.remove('tw-btn-disabled')
			btnNext.classList.add('tw-btn')
		}

		const printHandler = () => {
			window.print()
			enableNext()
		}

		const nextHandler = async () => {
			const res = await this.api.enable2FA()
			this.router.navigateTo('/settings/2fa/completed')
		}

		this.addEventListener(btnNext, 'click', nextHandler)
		this.addEventListener(btnPrint, 'click', printHandler)
		this.addEventListener(btnDownload, 'click', () => {
			if (backupCodes.length === 0) {
				console.log("no backup codes available")
				return
			}

			generateBackupCodesImage(backupCodes)
			enableNext()
		})

		loadBackupCodes()
	}
}
