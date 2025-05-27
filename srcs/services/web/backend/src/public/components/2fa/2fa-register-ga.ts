import { API } from "../../api-static.js"
import { Router } from "../../router-static.js"
import { formatString } from "../../utils/utils.js"

const compHTML = `
	<!-- CARD -->
	<div class="tw-card w-full p-4 space-y-4
								sm:max-w-sm sm:p-6 sm:space-y-6
								md:max-w-md"
	>

		<!-- CARD: HEADER -->
		<h1 class="text-xl text-center font-bold text-gray-700 md:text-2xl dark:text-gray-200">
				Register App
		</h1>

		<!-- CARD: CONTENT -->
		<div
			class="text-xs md:text-sm text-center p-4 space-y-4
							border border-transparent border-y-gray-200
							sm:p-6
							md:space-y-6
							dark:border-y-gray-700"
		>
			<p>Open the Google Autenticator app and scan QR code</p>
			<div>
				<img src="" alt="2FA QR Code" class="mx-auto rounded-md hidden" />
			</div>
			<p>Or enter the following code manually:</p>
			<p id="secret" class="font-bold text-base"></p>
			<p
				class="text-red-500 text-xs mt-1 hidden"
				id="message-error"
			></p>
			<p class="max-w-sm">Once App is registered, you'll start seeing 6-digit verification codes in the app</p>
		</div>

		<!-- CARD: FOOTER -->
		<div class="flex items-center justify-between">
			<a href="/settings" data-link class="tw-btn-outline w-24">Cancel</a>
			<!-- a href="/settings/2fa/verify" data-link class="tw-btn w-24">Next</a -->
			<button id="btn-next" class="tw-btn w-24 tw-btn-disabled">Next</button>
		</div>
	</div>
`

export class TwoFARegisterGA extends HTMLElement {
	private secretElm: HTMLElement | null = null
	private qrCodeElm: HTMLImageElement | null = null
	private messageError: HTMLElement | null = null
	private btnNext: HTMLButtonElement | null = null

	constructor() {
		super()
		this.render()
	}

	async connectedCallback() {
		this.secretElm = this.querySelector('#secret')
		this.qrCodeElm = this.querySelector('img')
		this.btnNext = this.querySelector('#btn-next')
		this.messageError = this.querySelector('#message-error')

		await this.loadQR()
	}

	disconnectedCallback() {
		this.btnNext?.removeEventListener('click', this)
	}

	handleEvent(event: Event) {
		event.preventDefault()
		Router.navigateTo('/settings/2fa/ga/verify')
	}

	private render() {
		this.innerHTML = compHTML
	}

	private showError(element: HTMLElement, message: string) {
		element.innerHTML = `<p class="text-red-500">${message}</p>`
		element.classList.remove('hidden')
	}

	private async loadQR() {
		if (!this.secretElm || !this.qrCodeElm || !this.btnNext) return
		if (!this.messageError ) return

		try {
			const res = await API.getQR()

			if (!res?.qr || !res?.secret) {
				this.showError(this.messageError, 'Unable to load QR code or secret. Please try again.')
				return
			}

			if (this.qrCodeElm) {
				this.qrCodeElm?.setAttribute('src', res.qr)
				this.qrCodeElm.classList.remove('hidden')
			}

			if (this.secretElm) this.secretElm.textContent = formatString(res.secret)

		} catch (err) {
			this.showError(this.messageError, 'Server error. Please refresh or try again later.')
		}

		this.btnNext.classList.remove('tw-btn-disabled')
		this.btnNext.addEventListener('click', this)
	}

}
