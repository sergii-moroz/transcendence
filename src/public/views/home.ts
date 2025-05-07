import { View } from "../view.js"

export class HomeView extends View {
	override setContent(input: Record<string, any>) {
		this.element.innerHTML = `
			<h2>Home</h2>
			<p>Welcome, ${input.username}</p>
			<nav>
				<a href="/about" data-link>About</a> |
				<a href="/login" data-link>login</a> |
				<a href="/profile" data-link>Profile</a> |
				<button id="join">JoinRoom</button>
				<button id="logout">Logout</button>
			</nav>
		`;
	}

	override async prehandler(): Promise<Record<string, any>> {
		if (this.router.currentUser)
			return { username: this.router.currentUser.username};
		return { username: 'error'};
	}

	setupEventListeners() {
		this.addEventListener(document.getElementById('logout')!, 'click', async () => {
			await this.api.logout();
			this.router.currentUser = null;
			return this.router.navigateTo('/login');
		});

		this.addEventListener(document.getElementById('join')!, 'click', (e) => {
			e.preventDefault();
			this.router.navigateTo('/waiting-room');
		});
	};
}
