import { API } from "../../api-static.js"
import { Router } from "../../router-static.js"

const innerHTML = `
<form class="space-y-4 md:space-y-6">
		<div>
			<label
				for="current-password"
				class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
			>
				Current password
			</label>
			<input
				type="password"
				name="current-password"
				id="current-password"
				class="tw-input"
				placeholder="••••••••"
				autofocus
			>
			<p
				class="text-red-500 text-xs mt-1 hidden"
				id="current-password-error"
			></p>
		</div>

		<div>
			<label
				for="password"
				class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
			>
				New password
			</label>
			<input
				type="password"
				name="password"
				id="password"
				placeholder="••••••••"
				class="tw-input"
			>
			<p
				class="text-red-500 text-xs mt-1 hidden"
				id="password-error"
			></p>
		</div>

		<div>
			<label
				for="repeated"
				class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
			>
				Repeat new password
			</label>
			<input
				type="password"
				name="repeated"
				id="repeated"
				placeholder="••••••••"
				class="tw-input"
			>
			<p
				class="text-red-500 text-xs mt-1 hidden"
				id="repeated-error"
			></p>
		</div>

		<button
			type="submit"
			class="w-full text-white text-xl bg-primary hover:bg-primary/80
				font-bold rounded-md text-sm px-5 py-2.5 text-center
				focus:ring-4 focus:outline-none focus:ring-primary-300
				dark:bg-primary dark:hover:bg-primary/80 dark:focus:ring-primary/80"
			>
			Reset
		</button>
	</form>
`

export class PasswordResetForm extends HTMLElement {
	private form: HTMLElement | null = null
	private currentPassword: HTMLInputElement | null = null
	private password: HTMLInputElement | null = null
	private repeated: HTMLInputElement | null = null
	private currentPasswordError: HTMLInputElement | null = null
	private passwordError: HTMLInputElement | null = null
	private repeatedError: HTMLInputElement | null = null

	constructor() {
		super()
		this.render()
	}

	connectedCallback() {
		this.form = this.querySelector('form')
		this.currentPassword = this.querySelector('#current-password')
		this.password = this.querySelector('#password')
		this.repeated = this.querySelector('#repeated')

		this.currentPasswordError = this.querySelector('#current-password-error')
		this.passwordError = this.querySelector('#password-error')
		this.repeatedError = this.querySelector('#repeated-error')

		this.form?.addEventListener('submit', this)
	}

	disconnectedCallback() {
		this.form?.removeEventListener('submit', this)
	}

	async handleEvent(event: Event) {
		event.preventDefault()

		if (!this.currentPassword || !this.password || !this.repeated) return
		if (!this.currentPasswordError || !this.passwordError || !this.repeatedError) return

		const currentPassword = this.currentPassword.value.trim()
		const password = this.password.value.trim()
		const repeated = this.repeated.value.trim()

		let hasError = false

		if (currentPassword.length <= 0) {
			this.showError(this.currentPasswordError, 'Password is required')
			hasError = true
		}

		if (password.length < 6) {
			this.showError(this.passwordError, 'Password must be at least 6 characters')
			hasError = true
		}

		if (password.length > 64) {
			this.showError(this.passwordError, 'Your password is too long')
			hasError = true
		}

		if (/\s+/g.test(password)) {
			this.showError(this.passwordError, 'Password could not contain white spaces')
			hasError = true
		}

		if (repeated !== password) {
			this.showError(this.repeatedError, 'Passwords do not match')
			hasError = true
		}

		if (hasError) return

		const res = await API.passwordReset(this.currentPassword.value, this.password.value, this.repeated.value)

		if (res.success) {
			return Router.navigateTo('/home')
		} else {
			this.showError(this.repeatedError, res.message ?? 'Password reset failed')
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

	private render() {
		this.innerHTML = innerHTML
	}

}
