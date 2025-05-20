import { API } from "../api-static.js"
import { Router } from "../router-static.js"

const loginFormHTML = `
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
				required
				autofocus
				>
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
				required
				>
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
	private form: HTMLElement | null
	private username: HTMLInputElement | null
	private password: HTMLInputElement | null

	constructor() {
		super()
		this.innerHTML = loginFormHTML
		this.form = this.querySelector('form')
		this.username = this.querySelector('#username')
		this.password = this.querySelector('#password')
		if (this.form) this.form.addEventListener('submit', this)

		// this.form = document.createElement('form')
		// this.append(this.form)
		// this.form.classList.add("myclass")
	}

	async handleEvent(event: Event) {
		event.preventDefault()
		if (!this.username || !this.password) return

		console.log('form is submitted')
		console.log('username:', this.username.value)
		console.log('password:', this.password.value)

		const res = await API.login(this.username.value, this.password.value)

		// 2FA Enabled: redirect to verify 2FA code
		if (res.requires2FA) {
			sessionStorage.setItem('temp2faToken', res.token)
			return Router.navigateTo('/login/2fa/verify')
		}

		// 2FA Disabled: Normal login method
		if (res.success) {
			return Router.navigateTo('/home')
		} else {
			// wrong login or password
			// show error
		}
		console.log("LoginForm: API.login:", res)
	}

}
