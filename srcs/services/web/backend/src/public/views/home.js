import { View } from "../view.js"

export class HomeView extends View {
	setContent = (username) => {
		this.element.innerHTML = `
			<h2>Home</h2>
			<p>Welcome, ${username}</p>
			<nav>
				<a href="/about" data-link>About</a> |
				<a href="/login" data-link>login</a> |
				<a href="/profile" data-link>Profile</a> |
				<button id="logout">Logout</button>
			</nav>
		`;
	}

	async prehandler() {
		return (this.router.currentUser ? this.router.currentUser.username : null);
	}

	setupEventListeners() {
		const form = document.getElementById('logout');
		const logoutHandler = async () => {
			await this.api.logout()
			this.router.currentUser = null;
			return this.router.navigateTo('/login');
		}
		this.addEventListener(form, 'click', logoutHandler);
	};
}
