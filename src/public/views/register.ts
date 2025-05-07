import { View } from "../view.js"

export class RegisterView extends View {
	setContent = () => {
		this.element.innerHTML = `
			<h2>Register</h2>
			<form id="registerForm">
				<input name="username" placeholder="Username" required><br>
				<input type="password" name="password" placeholder="Password" required><br>
				<button>Register</button>
			</form>
			<p><a href="/login" data-link>Login</a></p>
		`;
	}

	setupEventListeners() {
		const submitHandler = 
		this.addEventListener(document.getElementById('registerForm')!, 'submit', async (e) => {
			e.preventDefault();
			const form = e.target as HTMLFormElement;
			const formData = new FormData(form);
			const data = Object.fromEntries(formData) as {
				username: string;
				password: string;
			};
			const res = await this.api.register(data.username, data.password)

			if (!res) {
				alert('registration failed');
				form.reset();
				return;
			}

			const jsonRes = await res.json();

			if (res.ok) {
					return this.router.navigateTo('/login');
			} else {
					alert(jsonRes.error);
					form.reset();
					return;
			}
		});
	}
}
