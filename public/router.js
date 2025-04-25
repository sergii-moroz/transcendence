import { Api } from "./api.js"

export class Router {

	constructor(routes) {
		this.routes = routes;
		this.rootElement = document.getElementById('app');
		this.currentView = null;
		this.api = new Api();
		this.publicRoutes = ['/login', '/register', '/'];
		this.currentUser = null;

		window.addEventListener('popstate', this.handleRouteChange);
		document.addEventListener("click", (e) => {
			if (e.target.matches("[data-link]")) {
				e.preventDefault()
				this.navigateTo(e.target.getAttribute('href'))
				return ;
			}
		})

		this.handleRouteChange();
	}

	handleRouteChange = async () => {
		const path = window.location.pathname;

		if (this.currentView) {
			this.currentView.unmount();
			this.currentView = null;
		}

		try {
			if (!this.publicRoutes.includes(path)) {
				if (!this.currentUser) {
					this.currentUser = await this.api.checkAuth();
					if (!this.currentUser) {
							return this.navigateTo('/login');
					}
				}
			}
			else if (this.currentUser) {
					return this.navigateTo('/home');
			}
			// error: changing url to /about from login -> error messages in browser consol
			// error: changing url to /login from home -> able to go back (shouldn't), But changing url back to /home still works then

			//--debug
			// this.currentUser ? console.log(`user: ${this.currentUser.username}`) : console.log(`user: ${this.currentUser}`);
			// console.log(`path: ${path}`);


			const ViewClass = this.routes[path] || this.routes["404"];
			this.currentView = new ViewClass(this.api, this);
			await this.currentView.mount(this.rootElement);
		} catch (error) {
			console.error('Route handling failed:', error);
			this.navigateTo('/login');
		}
	}

	navigateTo = (url) => {
		window.history.pushState(null, null, url);
		this.handleRouteChange();
	}
}
