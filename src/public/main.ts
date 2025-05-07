import { NotFoundView } from "./views/notFound.js"
import { RegisterView } from "./views/register.js"
import { ProfileView } from "./views/profile.js"
import { AboutView } from "./views/about.js"
import { LoginView } from "./views/login.js"
import { HomeView } from "./views/home.js"
import { WaitingView } from "./views/waitingRoom.js"
import { GameView } from "./views/game.js"

import { Router } from "./router.js"
import { View } from "./view.js"

const routes: Record<string, typeof View> = {
	'/': LoginView,
	'/login': LoginView,
	'/register': RegisterView,
	'/home': HomeView,
	'/about': AboutView,
	'/profile': ProfileView,
	'/waiting-room': WaitingView,
	'/game/:gameRoomId': GameView,
	'404': NotFoundView
};

new Router(routes);
