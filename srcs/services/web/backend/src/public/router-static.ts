type tRoute = {
	template: string;
	title: string;
	description: string;
};

type tRoutes = {
	[path: string]: tRoute;
};
const APP_TITLE = "ft_transcendence"

const routes: tRoutes = {
	"404": {
		template: "/templates/404.html",
		title: `404 | ${APP_TITLE}`,
		description: "Page not found"
	},
	"/": {
		template: "/templates/index.html",
		title: `Home | ${APP_TITLE}`,
		description: "Home page"
	},
	"/login": {
		template: "/templates/login.html",
		title: `Login | ${APP_TITLE}`,
		description: "Login page"
	},
	"/login/2fa/verify": {
		template: "/templates/login-2fa-verify.html",
		title: `Login 2FA | ${APP_TITLE}`,
		description: "Login 2FA Verification"
	},
	"/settings/2fa/verification-method": {
		template: "/templates/2fa-verification-method.html",
		title: `Setup 2FA | ${APP_TITLE}`,
		description: "Two-factor authentication setup"
	},
}

export class Router {
	private static currentRoute: tRoute | null = null;

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

		const route = routes[path] ?? routes["404"]

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
