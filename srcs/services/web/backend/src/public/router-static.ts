import { WebSocket } from "@fastify/websocket";
import { routes, tRoute } from "./routes.js";
import { socialSocketManager } from "./SocialWebSocket.js";

export class Router {
	private static currentRoute: tRoute | null = null;
	static initSocket: boolean = false;

	static async init() {
		window.addEventListener("popstate", () => this.handleRouteChange());
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

		await this.handleRouteChange();
	}

	static async handleRouteChange() {
		const path = this.getSanitizedPath()
		let route

		if (path.startsWith('/game/')) {
			route = routes['/game/:gameRoomId'];
		} else if (path.startsWith('/tournament/')) {
			route = routes['/tournament/:tournamentId'];
		} else {
			route = routes[path] ?? routes["404"]
		}
		if (!this.initSocket && route.description == 'Home page') {
			socialSocketManager.init();
			this.initSocket = true;
		}
    
		try {
			const html = await this.loadTemplate(route.template)
			this.updateDOM(route, html)
			this.currentRoute = route;
		} catch (error) {
			console.error("ROUTER: Route handling failed:", error);
			await this.handleRouteChange(); // Fallback to 404
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
}

Router.init()
