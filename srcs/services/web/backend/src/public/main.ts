import { VerificationMethodView } from "./views/2fa-verification-method.js"
import { Register2FAView } from "./views/2fa-register.js"

import { WaitingView } from "./views/waitingRoom.js"
import { NotFoundView } from "./views/notFound.js"
import { RegisterView } from "./views/register.js"
import { SettingsView } from "./views/settings.js"
import { ProfileView } from "./views/profile.js"
import { AboutView } from "./views/about.js"
import { LoginView } from "./views/login.js"
import { HomeView } from "./views/home.js"
import { GameView } from "./views/game.js"
import { RootView } from "./views/root.js"

import { Router } from "./router.js"
import { View } from "./view.js"

const routes: Record<string, typeof View> = {
	'/': RootView,
	'/login': LoginView,
	'/register': RegisterView,
	'/home': HomeView,
	'/about': AboutView,
	'/profile': ProfileView,
	'/waiting-room': WaitingView,
	'/game/:gameRoomId': GameView,
	'/settings': SettingsView,
	'/settings/2fa/verification-method': VerificationMethodView,
	'/settings/2fa/register': Register2FAView,
	'404': NotFoundView
};

new Router(routes);
