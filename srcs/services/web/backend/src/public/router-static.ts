import { API } from "./api-static.js";
import { routes, tRoute } from "./routes.js";
import { socialSocketManager } from "./SocialWebSocket.js";

export class Router {
	private static currentRoute: tRoute | null = null;
	static initSocket: boolean = false;
	static username: string | null = null;
	private static publicRoutes: string[] = ['/', '/register', '/login', '/login/2fa/verify', '/metrics'] //add 2fa routes

	static async init() {
		window.addEventListener("popstate", () => this.handleRouteChange());
		document.addEventListener("click", (e: Event) => {
			const target = (e.target as HTMLElement).closest("[data-link]") as HTMLAnchorElement | null;
			if (target) {
				e.preventDefault()
				let href = target.getAttribute('href');
				if (href === '/profile') href += `/${this.username}`;
				if (href)
					this.navigateTo(href);
				return ;
			}
		})

		await this.handleRouteChange();
	}

	static async handleRouteChange() {
		const path = this.getSanitizedPath()
		let route

		if (path.startsWith('/game/')) {
			route = routes['/game/:gameRoomId'];
		} else if (path.startsWith('/tournament/')) {
			route = routes['/tournament/:tournamentId'];
		} else if (path.startsWith('/profile/')) {
			route = routes['/profile/:username'];
		} else {
			route = routes[path] ?? routes["404"]
		}
		if (!this.initSocket && !this.publicRoutes.includes(path)) {
			this.username = (await API.getUser()).username; //this also calls API.scheduleTokenRefresh() if token is expired
			if (this.username) {
				// console.log('aaa');
				socialSocketManager.init();
				if (!API.refreshTimeout) {
					await API.scheduleTokenRefresh();
				}
				this.initSocket = true;
			} else {
				route = routes["/unauthorized"]
			}
		}

		try {
			const html = await this.loadTemplate(route.template)
			this.updateDOM(route, html)
			this.currentRoute = route;
		} catch (error) {
			console.error("ROUTER: Route handling failed:", error);
			this.updateDOM(routes["error"], 'error');
		}
	}

	static navigateTo(url: string) {
		if (window.location.pathname === url) return;

		window.history.pushState(null, "", url);
		this.handleRouteChange();
	}

	private static getSanitizedPath(): string {
		const path = window.location.pathname;
		return path.replace(/\/$/, "").replace(/\.html$/, "") || "/";
	}

	private static async loadTemplate(templatePath: string): Promise<string> {
		const response = await fetch(templatePath);
		if (!response.ok) throw new Error(`ROUTER: Failed to load template: ${templatePath}`);
		return response.text();
	}

	private static updateDOM(route: tRoute, html: string) {
		const app = document.getElementById("app");
		if (app) app.innerHTML = html;

		document.title = route.title;

		let meta = document.querySelector('meta[name="description"]');
		if (!meta) {
			meta = document.createElement("meta");
			meta.setAttribute("name", "description");
			document.head.appendChild(meta);
		}
		meta.setAttribute("content", route.description);
	}

	static async logout() {
		socialSocketManager.disconnect();
		this.initSocket = false;
		this.username = null;
		await API.logout();
		this.navigateTo('/login');
	}
}
