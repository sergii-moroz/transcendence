import { Api } from "./api.js"
import { View } from "./view.js"
import { User } from "./types.js"

export class Router {
	routes: Record<string, typeof View>;
	rootElement: HTMLElement | null;
	currentView: View | null;
	api: Api;
	publicRoutes: string[];
	currentUser: User | null;

	constructor(routes: Record<string, typeof View> ) {
		this.routes = routes;
		this.rootElement = document.getElementById('app');
		this.currentView = null;
		this.api = new Api();
		this.publicRoutes = ['/login', '/register', '/', '/login/2fa/verify'];
		this.currentUser = null;

		window.addEventListener('popstate', this.handleRouteChange);
		document.addEventListener("click", (e: Event) => {
			const target = e.target as HTMLElement;
			if (target.matches("[data-link]")) {
				e.preventDefault()
				const href = target.getAttribute('href');
				if (href)
					this.navigateTo(href);
				return ;
			}
		})

		this.handleRouteChange();
	}

	handleRouteChange = async () => {
		const path: string = window.location.pathname;

		if (this.currentView) {
			this.currentView.unmount();
			this.currentView = null;
		}

		try {
			if (!this.publicRoutes.includes(path)) {
				if (!this.currentUser) { console.log("ROUTER checkAuth:")
					this.currentUser = await this.api.checkAuth();
					if (!this.currentUser) {
						console.log("ROUTER USER: NULL")
						return this.navigateTo('/login');
					}
				} else {
					console.log("ROUTER: USER:", this.currentUser)
					// it means this.currentUser isn't NULL
					// but access token && CSRF Token is expired
					//
					// await this.api.refreshToken()
					// !!! TODO !!!

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
			let ViewClass: typeof View;

			if (path.startsWith('/game/')) {
				ViewClass = this.routes['/game/:gameRoomId'];
				this.currentView = new ViewClass(this.api, this);
			} else {
				ViewClass = this.routes[path] || this.routes["404"];
				this.currentView = new ViewClass(this.api, this);
			}
			await this.currentView.mount(this.rootElement!);
		} catch (error) {
			console.error('Route handling failed:', error);
			this.navigateTo('/login');
		}
	}

	navigateTo = (url: string) => {
		window.history.pushState(null, '', url);
		this.handleRouteChange();
	}
}
