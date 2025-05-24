import { API } from "../../api-static.js"
import { Router } from "../../router-static.js"
import { generateBackupCodesImage } from "../../utils/utils.js"

const innerHTML = `
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
					border border-gray-200 dark:text-gray-200 dark:border-gray-700 hidden"
			>
				CODES
			</div>
			<p
				class="text-red-500 text-xs text-left mt-1 hidden"
				id="message-error"
			></p>

			<div>
				<button id="btn-print" class="tw-btn-outline">Print</button>
				<button id="btn-download" class="tw-btn-outline">Download</button>
			</div>
		</div>

		<!-- CARD: FOOTER -->
		<div class="flex items-center justify-between">
			<a href="/settings" data-link class="tw-btn-outline w-24">Cancel</a>
			<button id="btn-next" class="tw-btn-disabled w-24" disabled>Next</button>
		</div>
	</div>
`

export class TwoFABackupGA extends HTMLElement {
	private btnNext: HTMLButtonElement | null = null
	private btnPrint: HTMLButtonElement | null = null
	private btnDownload: HTMLButtonElement | null = null
	private codesContainer: HTMLElement | null = null
	private messageError: HTMLElement | null = null
	private backupCodes: string[] = []

	constructor() {
		super()
		this.render()
	}

	async connectedCallback() {
		this.btnNext = this.querySelector('#btn-next')
		this.btnPrint = this.querySelector('#btn-print')
		this.btnDownload = this.querySelector('#btn-download')
		this.codesContainer = this.querySelector('#codes')
		this.messageError = this.querySelector('#message-error')

		this.btnPrint?.addEventListener('click', this.handlePrint)
		this.btnDownload?.addEventListener('click', this.handleDownload)
		this.btnNext?.addEventListener('click', this.handleNext)

		const is2FAEnabled = await this.is2FAEnabled()

		is2FAEnabled
			? Router.navigateTo('/settings/2fa/already-enabled')
			: await this.loadBackupCodes()
	}

	disconnectedCollback() {
		this.btnNext?.removeEventListener('click', this.handleNext)
		this.btnPrint?.removeEventListener('click', this.handlePrint)
		this.btnDownload?.removeEventListener('click', this.handleDownload)
	}

	private async loadBackupCodes() {
		if (!this.codesContainer || !this.messageError) return

		const res = await API.create2FABackupCodes()

		if (res.success) {
			this.backupCodes = res.codes
			this.codesContainer.innerHTML = this.backupCodes.map(code => `<p>${code}</p>`).join('')
			this.codesContainer.classList.remove('hidden')
		} else {
			this.showError(this.messageError, res.message ?? 'Server error. Please refresh or try again later')
		}
	}

	private render() {
		this.innerHTML = innerHTML
	}

	private enableBtnNext() {
		if (!this.btnNext) return

		this.btnNext.disabled = false
		this.btnNext.classList.remove('tw-btn-disabled')
		this.btnNext.classList.add('tw-btn')
	}

	private handlePrint = () => {
		window.print()
		this.enableBtnNext()
	}

	private handleDownload = () => {
		if (this.backupCodes.length === 0) return

		generateBackupCodesImage(this.backupCodes)
		this.enableBtnNext()
	}

	private async handleNext() {
		const res = await API.set2FAEnabled()

		if (res.success) {
			Router.navigateTo('/settings/2fa/ga/completed')
		} else {
			if (!this.messageError) return

			this.showError(this.messageError, res.message ?? 'Server error. Please refresh or try again later')
		}
	}

	private async is2FAEnabled() {
		if (!this.messageError) return

		const res = await API.is2FAEnabled()

		if (res.success) {
			return (res.enabled)
		} else {
			this.showError(this.messageError, res.message ?? 'Server error. Please refresh or try again later')
		}

		return false
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
