import { API } from "../../api-static.js"
import { Router } from "../../router-static.js"

const innerHTML = `
	<form>
		<div class="tw-card w-full p-4 space-y-4
									sm:max-w-sm sm:p-6 sm:space-y-6
									md:max-w-md"
		>
			<!-- CARD: HEADER -->
			<h1 class="text-xl text-center font-bold text-gray-700 md:text-2xl dark:text-gray-200">
					Confirm Identity
			</h1>

			<!-- CARD: CONTENT -->
			<div
				class="text-xs md:text-sm p-4 space-y-4
								border border-transparent border-y-gray-200
								sm:p-6
								md:space-y-6
								dark:border-y-gray-700"
			>
				<p class="mx-auto">Enter your current 2FA code to disable two-factor authentication.</p>
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
				<p
					class="text-red-500 text-xs mt-1 hidden"
					id="message-error"
				></p>
			</div>

			<!-- CARD: FOOTER -->
			<div class="flex items-center justify-between">
				<a href="/settings" data-link class="tw-btn-outline w-24">Cancel</a>
				<button type="submit" class="tw-btn-disabled w-24" disabled>Confirm</button>
			</div>
		</div>
	</form>
`

export class TwoFADisableVerify extends HTMLElement {
	private form: HTMLElement | null = null
	private btnSubmit: HTMLButtonElement | null = null
	private inputElm: HTMLInputElement | null = null
	private messageError: HTMLElement | null = null


	constructor() {
		super()
		this.render()
	}

	connectedCallback() {
		this.form = this.querySelector('form')
		this.inputElm = this.querySelector('input')
		this.btnSubmit = this.querySelector('button')
		this.messageError = this.querySelector('#message-error')

		this.form?.addEventListener('submit', this.handleSubmit)
		this.inputElm?.addEventListener('input', this.handleInput)
	}

	disconnectedCallback() {
		this.form?.removeEventListener('submit', this.handleSubmit)
		this.inputElm?.removeEventListener('input', this.handleInput)
	}

	private render() {
		this.innerHTML = innerHTML
	}

	private handleSubmit = async (event: Event) => {
		event.preventDefault()
		console.log("prevetDefatult", event.type)
		if (!this.inputElm || !this.messageError ) return

		this.btnSubmitDisabled()
		console.log("btnSubmitDisabled")

		try {
			const code = this.inputElm.value
			const res = await API.disable2FA(code)

			if (res.success) {
				Router.navigateTo('/settings/2fa/disabled/confirmation')
			} else {
				this.showError(this.messageError, res.message ?? 'Verification failed')
			}

		} catch (err) {
			this.showError(this.messageError, 'Server error. Please refresh or try again later')
		}

		this.btnSubmitEnabled()
	}

	private handleInput = () => {
		if (this.inputElm) {
			this.inputElm.value = this.inputElm?.value.replace(/\D/g, '').slice(0, 6)
			if (this.inputElm.value.length === 6) {
				this.btnSubmitEnabled()
			} else {
				this.btnSubmitDisabled()
			}
		}
	}

	private btnSubmitEnabled() {
		if (this.btnSubmit) {
			this.btnSubmit.disabled = false
			this.btnSubmit.classList.add('tw-btn')
			this.btnSubmit.classList.remove('tw-btn-disabled')
		}
	}

	private btnSubmitDisabled() {
		if (this.btnSubmit) {
			this.btnSubmit.disabled = true
			this.btnSubmit.classList.remove('tw-btn')
			this.btnSubmit.classList.add('tw-btn-disabled')
		}
	}

	private showError(element: HTMLElement, message: string) {
		let errorTimeout

		clearTimeout(errorTimeout)

		element.innerHTML = `
		<div class="relative">
			<p class="py-1">${message}</p>
			<div class="absolute bottom-0 left-0 h-1 bg-red-300 animate-error-bar w-full rounded-sm"></div>
		</div>
		`
		element.classList.remove('hidden')
		errorTimeout = setTimeout(() => {
			element.innerHTML = ''
			element.classList.add('hidden')
		}, 4000)
	}
}
