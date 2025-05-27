// import { VerificationMethodView } from "./views/2fa-verification-method.js"
// import { Login2FAVerifyView } from "./views/login-2fa-verify.js"

import { WaitingView } from "./views/waitingRoom.js"
import { NotFoundView } from "./views/notFound.js"
// import { RegisterView } from "./views/register.js"
import { SettingsView } from "./views/settings.js"
import { ProfileView } from "./views/profile.js"
// import { LoginView } from "./views/login.js"
// import { HomeView } from "./views/home.js"
import { GameView } from "./views/game.js"
import { RootView } from "./views/root.js"
import { TournamentView } from "./views/tournament.js"
import { TournamentWaitingView } from "./views/tournamentWaitingRoom.js"

import { Router } from "./router.js"
import { View } from "./view.js"

const routes: Record<string, typeof View> = {
	// '/': RootView,
	// '/login': LoginView,
	// '/login/2fa/verify': Login2FAVerifyView,
	// '/register': RegisterView,
	// '/home': HomeView,
	'/profile': ProfileView,
	'/waiting-room': WaitingView,
	'/game/:gameRoomId': GameView,
	'/tournament-waiting-room': TournamentWaitingView,
	'/tournament/:tournamentId': TournamentView,
	'/settings': SettingsView,
	// '/settings/2fa/verification-method': VerificationMethodView,
	'404': NotFoundView
};

new Router(routes);
