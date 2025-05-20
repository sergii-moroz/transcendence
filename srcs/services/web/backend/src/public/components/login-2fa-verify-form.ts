import { API } from "../api-static.js"
import { Router } from "../router-static.js"

const formHTML = `
	<form>
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
				<button type="submit" class="tw-btn w-24">Verify</button>
			</div>
		</div>
	</form>
`

interface errorData {
	message: string,
	statusCode: number,
	code: string
}

export class Login2FAVerifyForm extends HTMLElement {
	private form: HTMLElement | null
	private inputElm: HTMLInputElement | null
	private errorMessage: HTMLElement | null

	constructor() {
		super()
		this.innerHTML = formHTML
		this.form = this.querySelector('form')
		this.inputElm = this.querySelector('input')
		this.errorMessage = this.querySelector('#error-message')
		if (this.form) this.addEventListener('submit', this)
		if (this.inputElm) this.addEventListener('input', this)
	}

	/**
	 * Handle events on the Web Component
	 * @param {Event} event The event object
	 */
	// handleEvent(event) {
	// 	this[`${event.type}Handler`](event)
	// }

	async handleEvent(event: Event) {
		console.log("event.type", event.type)
		event.preventDefault()

		if (!this.inputElm) return

		console.log(`${this.className}: inputElm.value:`, this.inputElm.value)
		const res = await API.login2FAVerify(this.inputElm.value)
		console.log(`${this.className}: API.login2FAVerify:`, res)
		if (res.success) {
			Router.navigateTo('/home')
		} else {
			this.showError(res)
		}

		console.log(`${this.className}: API`)
		console.log('code submit')
	}

	private showError(err: errorData) {
		let errorTimeout

		if (this.errorMessage) {
			clearTimeout(errorTimeout)

			this.errorMessage.innerHTML = `
				<div class="relative">
					<p class="bg-red-500/10 text-xs text-red-600 px-4 py-2 rounded-sm border border-red-200 dark:border-red-900">
						${err.message} (${err.statusCode} : ${err.code})
					</p>
					<div class="absolute bottom-0 left-0 h-1 bg-red-300 animate-error-bar w-full rounded-sm"></div>
				</div>
			`

			errorTimeout = setTimeout(() => {
				if (this.errorMessage) this.errorMessage.innerHTML = ''
			}, 5000)
		}
	}

	private inputHandler() {
		if (this.inputElm) {
			this.inputElm.value = this.inputElm?.value.replace(/\D/g, '').slice(0, 6)

			if (this.inputElm.value.length === 6) {

			}
		}
	}

	private async submitHandler() {

	}
}
