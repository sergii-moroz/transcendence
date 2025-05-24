import { API } from "../api-static.js"
import { Router } from "../router-static.js"

const formHTML = `
	<form class="space-y-4 md:space-y-6">
		<div>
			<label
				for="username"
				class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
			>
				Your Nickname
			</label>

			<input
				type="text"
				name="username"
				id="username"
				class="tw-input"
				placeholder="Nickname"
				autofocus
			>
			<p
				class="text-red-500 text-xs mt-1 hidden"
				id="username-error"
			></p>
		</div>

		<div>
			<label
				for="password"
				class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
			>
				Password
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

		<button
			type="submit"
			class="w-full text-white text-xl bg-primary hover:bg-primary/80
				font-bold rounded-md text-sm px-5 py-2.5 text-center
				focus:ring-4 focus:outline-none focus:ring-primary-300
				dark:bg-primary dark:hover:bg-primary/80 dark:focus:ring-primary/80"
			>
			Sign in
		</button>
	</form>
`

export class LoginForm extends HTMLElement {
	private form: HTMLElement | null = null
	private username: HTMLInputElement | null = null
	private password: HTMLInputElement | null = null
	private usernameError: HTMLElement | null = null
	private passwordError: HTMLElement | null = null

	constructor() {
		super()
		this.innerHTML = formHTML
	}

	connectedCallback() {
		this.form = this.querySelector('form')
		this.username = this.querySelector('#username')
		this.password = this.querySelector('#password')

		this.usernameError = this.querySelector('#username-error')
		this.passwordError = this.querySelector('#password-error')

		this.form?.addEventListener('submit', this)
	}

	disconnectedCallback() {
		this.form?.removeEventListener('submit', this)
	}

	async handleEvent(event: Event) {
		event.preventDefault()

		if (!this.username || !this.password) return
		if (!this.usernameError || !this.passwordError) return

		const username = this.username.value.trim()
		const password = this.password.value.trim()

		let hasError = false

		// VALIDATION

		if (username.length <= 0) {
			this.showError(this.usernameError, 'Username is required')
			hasError = true
		}

		if (password.length <= 0) {
			this.showError(this.passwordError, 'Password is required')
			hasError = true
		}

		if (hasError) return

		const res = await API.login(this.username.value, this.password.value)

		if (res.requires2FA) {
			sessionStorage.setItem('temp2faToken', res.token)
			return Router.navigateTo('/login/2fa/verify')
		}

		if (res.success) {
			return Router.navigateTo('/home')
		} else {
			this.showError(this.passwordError, res.message ?? 'Login failed')
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
