import { View } from "../view.js"

export class LoginView extends View {
	setContent = () => {
		this.element.innerHTML = `
			<h2>Login</h2>
			<form id="loginForm">
				<input name="username" placeholder="Username" required><br>
				<input type="password" name="password" placeholder="Password" required><br>
				<button>Login</button>
			</form>
			<p><a href="/register" data-link>Register</a></p>
		`;
	}

	setupEventListeners() {
		const form = document.getElementById('loginForm');

		const submitHandler = async e => {
			e.preventDefault();
			const { username, password } = e.target;
			const res = await this.api.login(username.value, password.value);

			if (!res) return

			const data = await res.json();

			if (res.ok) {
				return this.router.navigateTo('/home');
			} else {
				alert(data.error);
				e.target.reset();
				return ;
			}
		};

		this.addEventListener(form, 'submit', submitHandler);
	}
}
