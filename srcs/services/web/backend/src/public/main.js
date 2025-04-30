import { NotFoundView } from "./views/notFound.js"
import { RegisterView } from "./views/register.js"
import { ProfileView } from "./views/profile.js"
import { AboutView } from "./views/about.js"
import { LoginView } from "./views/login.js"
import { LobbyView } from "./views/lobby.js"
import { HomeView } from "./views/home.js"

import { Router } from "./router.js"

const routes = {
	'/': LoginView,
	'/login': LoginView,
	'/register': RegisterView,
	'/home': HomeView,
	'/about': AboutView,
	'/profile': ProfileView,
	'/lobby': LobbyView,
	'404': NotFoundView
};

new Router(routes);
