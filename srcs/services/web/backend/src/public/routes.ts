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

	"/login/2fa/verify": {
		template: "/templates/login-2fa-verify.html",
		title: `Login 2FA | ${APP_TITLE}`,
		description: "Login verify 2FA page"
	},

	"/home": {
		template: "/templates/home.html",
		title: `Home | ${APP_TITLE}`,
		description: "Home page"
	},

	"/settings": {
		template: "/templates/settings/index.html",
		title: `Settings | ${APP_TITLE}`,
		description: "Settings page"
	},

	"/settings/2fa/method": {
		template: "/templates/settings/2fa/method.html",
		title: `2FA Method | ${APP_TITLE}`,
		description: "Select two factor authentification method"
	},

	"/settings/2fa/ga/register": {
		template: "/templates/settings/2fa/ga-register.html",
		title: `2FA Register | ${APP_TITLE}`,
		description: "Register Google Authenticator"
	},

	"/settings/2fa/ga/verify": {
		template: "/templates/settings/2fa/ga-verify.html",
		title: `2FA Verify | ${APP_TITLE}`,
		description: "Verify Google Authenticator"
	},

	"/settings/2fa/ga/backup": {
		template: "/templates/settings/2fa/ga-backup.html",
		title: `2FA Backup | ${APP_TITLE}`,
		description: "Backup codes"
	},

	"/settings/2fa/completed": {
		template: "/templates/settings/2fa/completed.html",
		title: `2FA Competed | ${APP_TITLE}`,
		description: "2FA setup is completed"
	},

	"/settings/2fa/already-enabled": {
		template: "/templates/settings/2fa/already-enabled.html",
		title: `2FA Competed | ${APP_TITLE}`,
		description: "2FA setup is completed"
	},

	"/settings/2fa/disable-verify": {
		template: "/templates/settings/2fa/disable-verify.html",
		title: `2FA Disable | ${APP_TITLE}`,
		description: "Disable 2FA"
	},

	"/settings/2fa/disabled/confirmation": {
		template: "/templates/settings/2fa/disabled-confirmation.html",
		title: `2FA Disabled | ${APP_TITLE}`,
		description: "Confirmation of disabling 2FA"
	},

}
