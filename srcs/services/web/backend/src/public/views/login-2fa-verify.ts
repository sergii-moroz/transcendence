import {
	iconCheck,
	iconChevronLeft,
} from "../components/icons.js";

import { View } from "../view.js"

export class Login2FAVerifyView extends View {
	setContent = () => {

		this.element.innerHTML = `
			<header
				class="bg-white border border-transparent shadow
					dark:bg-gray-800 dark:border-b-gray-700"
			>
				<div
					class="flex items-center justify-between py-4 px-8 md:px-11 max-w-7xl mx-auto"
				>
					<a href="/login" data-link class="cursor-pointer hover:underline hover:decoration-2 hover:decoration-primary hover:underline-offset-4" >
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

					<!-- CARD -->
					<form id="verify-2fa-form">
						<div class="tw-card w-full p-4 space-y-4
													sm:max-w-sm sm:p-6 sm:space-y-6
													md:max-w-md"
						>
							<!-- CARD: HEADER -->
							<h1 class="text-xl text-center font-bold text-gray-700 md:text-2xl dark:text-gray-200">
									Verify
							</h1>

							<!-- CARD: CONTENT -->
							<div
								class="text-xs md:text-sm p-4 space-y-4
												border border-transparent border-y-gray-200
												sm:p-6
												md:space-y-6
												dark:border-y-gray-700"
							>
								<p class="mx-auto">Enter a code from Google Authenticator to login</p>
								<div>
									<label
										for="code"
										class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
									>6-digit code</label>
									<input
										class="tw-input"
										type="text"
										name="code"
										id="code"
										pattern="[0-9]*"
										maxlength="6"
										placeholder="424242"
									>
								</div>
								<div id="error-message"></div>
							</div>

							<!-- CARD: FOOTER -->
							<div class="flex items-center justify-between">
								<a href="/login" data-link class="tw-btn-outline w-24">Cancel</a>
								<button id="btn-submit" type="submit" class="tw-btn-disabled w-24" disabled>Verify</button>
							</div>
						</div>
					</form>
				</div>
			</section>
		`;
	}

	setupEventListeners() {
		const form = document.getElementById('verify-2fa-form')
		const errorMessage = document.getElementById('error-message')
		const btnSubmit = document.getElementById('btn-submit') as HTMLButtonElement
		const inputCode = document.getElementById('code') as HTMLInputElement

		const inputHandler = () => {
			if (inputCode && btnSubmit) {
				inputCode.value = inputCode.value.replace(/\D/g, '').slice(0, 6)

				if (inputCode.value.length === 6) {
					btnSubmit.disabled = false
					btnSubmit.classList.add('tw-btn')
					btnSubmit.classList.remove('tw-btn-disabled')
				} else {
					btnSubmit.classList.remove('tw-btn')
					btnSubmit.classList.add('tw-btn-disabled')
				}
			}
		}

		interface errorData {
			message: string,
			statusCode: number,
			code: string
		}

		const showError = (data: errorData) => {
			let errorTimeout

			if (errorMessage) {
				clearTimeout(errorTimeout)

				errorMessage.innerHTML = `
					<div class="relative">
						<p class="bg-red-500/10 text-xs text-red-600 px-4 py-2 rounded-sm border border-red-200 dark:border-red-900">
							${data.message} (${data.statusCode} : ${data.code})
						</p>
						<div class="absolute bottom-0 left-0 h-1 bg-red-300 animate-error-bar w-full rounded-sm"></div>
					</div>
					`

				errorTimeout =  setTimeout(() => {
					errorMessage.innerHTML = ''
				}, 5000)
			}
		}

		const submitHandler = async (event: Event) => {
			event.preventDefault()
			const { code } = event.target as HTMLFormElement
			const res = await this.api.verify2FALogin(code.value)

			// if (!res) return

			const data = await res.json()

			if (res.ok) {
				return this.router.navigateTo('/home')
			} else {
				showError(data)
			}
		}

		if (inputCode) {
			this.addEventListener(inputCode, 'input', inputHandler)
		}

		if (form) {
			this.addEventListener(form, 'submit', submitHandler)
		}
	}
}
