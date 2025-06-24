import { API } from "../../api-static.js"
import { Router } from "../../router-static.js"
import { icon2FA } from "../icons/icons.js"

const innerHTML = `
	<button id="btn-enable" class="flex items-center justify-center rounded-lg whitespace-nowrap bg-green-500/20 hover:bg-green-500/30 px-4 py-2 text-green-600 dark:text-green-300 transition-colors w-full">
		<span id="icon">${icon2FA}</span>
		<span id="text">loading...</span>
	</button>

	<!-- Mobile Menu Modal -->
	<div
		id="dlg-confirm"
		class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden items-center z-50 flex flex-col pt-20
		"
	>
		<div class="tw-card text-center p-6 w-80 space-y-4 relative">
			<h2 class="text-xl font-bold mb-4 dark:text-white">Disable two factor authentification?</h2>
			<p>Disabling 2FA will remove <strong>all backup codes</strong> and make your account less secure.
				You can re-enable it later, but new backup codes will be generated.</p>
			<button id="btn-confirm" class="tw-btn w-full">Disable 2FA</button>
			<button id="btn-cancel" class="tw-btn-outline w-full">Cancel</button>
		</div>
	</div>
`

export class Button2FA extends HTMLElement {
	private is2FAEnabled = false
	private btnEnable: HTMLButtonElement | null = null
	private dlgConfirm: HTMLElement | null = null
	private btnConfirm: HTMLButtonElement | null = null
	private btnCancel: HTMLButtonElement | null = null

	constructor() {
		super()
		this.render()
	}

	async connectedCallback() {
		this.btnEnable = this.querySelector('#btn-enable')
		this.dlgConfirm = this.querySelector('#dlg-confirm')
		this.btnConfirm = this.querySelector('#btn-confirm')
		this.btnCancel = this.querySelector('#btn-cancel')

		const { enabled, success } = await API.is2FAEnabled()
		this.is2FAEnabled = enabled

		if (!this.btnEnable) return
		this.btnEnable.querySelector('#text')!.textContent = this.is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'
		this.btnEnable?.addEventListener('click', this)
		this.btnCancel?.addEventListener('click', this.handleOnClickBtnCancel)
		this.btnConfirm?.addEventListener('click', this.handleOnClickBtnConfirm)
	}

	handleEvent(event: Event) {
		console.log("is2FAEnabled:", this.is2FAEnabled)
		this.is2FAEnabled ? this.handleDisable2FA() : this.handleEnable2FA()
	}

	disconnectedCallback() {
		this.btnEnable?.removeEventListener('click', this)
		this.btnCancel?.removeEventListener('click', this.handleOnClickBtnCancel)
		this.btnConfirm?.removeEventListener('click', this.handleOnClickBtnConfirm)
	}

	private handleEnable2FA() {
		Router.navigateTo('/settings/2fa/method')
	}

	private handleDisable2FA() {
		console.log('click: handle disable 2FA')
		this.dlgConfirm?.classList.remove('hidden')
	}

	private render() {
		this.innerHTML = innerHTML
	}

	private handleOnClickBtnCancel = () => {
		this.dlgConfirm?.classList.add('hidden')
	}

	private handleOnClickBtnConfirm = () => {
		this.dlgConfirm?.classList.add('hidden')
		Router.navigateTo('/settings/2fa/disable-verify')
	}
}
