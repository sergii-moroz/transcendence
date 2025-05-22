export type tRoute = {
	template: string;
	title: string;
	description: string;
};

type tRoutes = {
	[path: string]: tRoute;
};

const APP_TITLE = "ft_transcendence"

export const routes: tRoutes = {

	"404": {
		template: "/templates/404.html",
		title: `404 | ${APP_TITLE}`,
		description: "Page not found"
	},

	"/": {
		template: "/templates/index.html",
		title: `${APP_TITLE}`,
		description: "Landing page"
	},

	"/register": {
		template: "/templates/register.html",
		title: `Register | ${APP_TITLE}`,
		description: "Register"
	},

	"/login": {
		template: "/templates/login.html",
		title: `Login | ${APP_TITLE}`,
		description: "Login page"
	},

	"/home": {
		template: "/templates/home.html",
		title: `Home | ${APP_TITLE}`,
		description: "Home page"
	},

}
