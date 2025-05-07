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

		this.addEventListener(document.getElementById('loginForm')!, 'submit', async (e: Event) => {
			e.preventDefault();
			const form = e.target as HTMLFormElement;
			
			const res = await this.api.login(form.username, form.password);

			if (!res) return

			const jsonRes = await res.json();

			if (res.ok) {
				return this.router.navigateTo('/home');
			} else {
				alert(jsonRes.error);
				form.reset();
				return ;
			}
		});
	}
}
