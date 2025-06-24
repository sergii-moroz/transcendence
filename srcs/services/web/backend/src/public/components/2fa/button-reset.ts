import { Router } from "../../router-static.js"
import { iconLock2 } from "../icons/icons.js"

export class ButtonPasswordReset extends HTMLElement {
	private btnReset: HTMLButtonElement | null = null
	private dlgConfirm: HTMLElement | null = null
	private btnConfirm: HTMLButtonElement | null = null
	private btnCancel: HTMLButtonElement | null = null

	constructor() {
		super()
	}

	connectedCallback() {
		this.render()
		this.btnReset = this.querySelector('#btn-reset')
		this.dlgConfirm = this.querySelector('#dlg-confirm-reset')
		this.btnConfirm = this.querySelector('#btn-confirm-reset')
		this.btnCancel = this.querySelector('#btn-cancel-reset')
		// console.log("connected:", this.dlgConfirm)

		this.btnReset?.addEventListener('click', this.handleOnClickBtnReset)
		this.btnCancel?.addEventListener('click', this.handleOnClickBtnCancel)
		this.btnConfirm?.addEventListener('click', this.handleOnClickBtnConfirm)
	}

	disconnectedCallback() {
		this.btnReset?.removeEventListener('click', this.handleOnClickBtnReset)
		this.btnCancel?.removeEventListener('click', this.handleOnClickBtnCancel)
		this.btnConfirm?.removeEventListener('click', this.handleOnClickBtnConfirm)
	}

	private handleOnClickBtnReset = () => {
		console.log('ClickBtnReset')
		console.log("dlgConfirmReset:", this.dlgConfirm)
		this.dlgConfirm?.classList.remove('hidden')
	}

	private handleOnClickBtnCancel = () => {
		this.dlgConfirm?.classList.add('hidden')
	}

	private handleOnClickBtnConfirm = () => {
		this.dlgConfirm?.classList.add('hidden')
		Router.navigateTo('/settings/password/reset')
	}

	private render() {
		this.innerHTML = `
		<button id="btn-reset" class="flex items-center justify-center rounded-lg whitespace-nowrap bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2 text-blue-600 dark:text-blue-300  transition-colors w-full">
			${iconLock2}
			Change Password
		</button>

		<!-- Mobile Menu Modal -->
		<div
			id="dlg-confirm-reset"
			class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden items-center z-50 flex flex-col pt-20
			"
		>
		<div class="tw-card text-center p-6 w-80 space-y-4 relative">
			<h2 class="text-xl font-bold mb-4 dark:text-white">Reset password?</h2>
			<p>Continue with password reset?</p>
			<button id="btn-confirm-reset" class="tw-btn w-full">Reset</button>
			<button id="btn-cancel-reset" class="tw-btn-outline w-full">Cancel</button>
		</div>
	</div>
		`
	}
}
