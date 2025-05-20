import { API } from "../api-static.js"
import { Router } from "../router-static.js"

export class Button2FA extends HTMLElement {
	is2FAEnabled: boolean
	btn: HTMLElement

	constructor() {
		super()

		this.is2FAEnabled = false
		this.btn = document.createElement('button')
		this.append(this.btn)
		this.render()

		this.init2FAStatus();
		// this.addEventListener('click', this)
	}

	private async init2FAStatus(): Promise<void> {
		try {
			const response = await API.is2FAEnabled()
			const data = await response.json()
			this.is2FAEnabled = data.enabled
			this.render()
		} catch (error) {
			console.log('Button2FA: Failed to check 2FA status:', error)
		}
	}

	handleEvent(event: Event) {
		this.is2FAEnabled = !this.is2FAEnabled
		this.render()
		Router.navigateTo('/settings/2fa/verification-method')
	}

	private render(): void {
		this.btn.innerText = this.is2FAEnabled ? "Disable 2FA" : "Enable 2FA"
	}

}
