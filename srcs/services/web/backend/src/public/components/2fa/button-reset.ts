import { Router } from "../../router-static.js"
import { iconLock2 } from "../icons/icons.js"

export class ButtonPasswordReset extends HTMLElement {
	private btnReset: HTMLButtonElement | null = null

	constructor() {
		super()
	}

	connectedCallback() {
		this.render()
		this.btnReset = this.querySelector('#btn-reset')
		// console.log("connected:", this.dlgConfirm)

		this.btnReset?.addEventListener('click', this.handleOnClickBtnReset)
	}

	disconnectedCallback() {
		this.btnReset?.removeEventListener('click', this.handleOnClickBtnReset)
	}

	private handleOnClickBtnReset = () => {
		Router.navigateTo('/settings/password/reset')
	}

	private render() {
		this.innerHTML = `
		<button id="btn-reset" class="flex items-center justify-center rounded-lg whitespace-nowrap bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2 text-blue-600 dark:text-blue-300  transition-colors w-full">
			${iconLock2}
			Change Password
		</button>
		`
	}
}
