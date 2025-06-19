import { TwoFABackupGA } from "./components/2fa/2fa-backup-ga.js";
import { TwoFADisableVerify } from "./components/2fa/2fa-disable-verify.js";
import { TwoFALoginVerify } from "./components/2fa/2fa-login-verify.js";
import { TwoFARegisterGA } from "./components/2fa/2fa-register-ga.js";
import { TwoFAVerifyGA } from "./components/2fa/2fa-verify-ga.js";
import { Button2FA } from "./components/2fa/button-2fa.js";
import { ButtonThemeToggle } from "./components/button-theme-toggle.js";
import { HomeContent } from "./components/home/content.js";
import { HomeHeader } from "./components/home/header.js";
import { PlayCard } from "./components/home/play-card.js";
import { Sidebar } from "./components/sidebar/sidebarBase.js";
import { StatsCard } from "./components/home/stats-card.js";
import { TopPlayerCard } from "./components/home/top-player-card.js";
import { IconCheck } from "./components/icons/icon-check.js";
import { IconChevronLeft } from "./components/icons/icon-chevron-left.js";
import { IconHomeMultiplayer } from "./components/icons/icon-home-multiplayer.js";
import { IconHomeSingleplayer } from "./components/icons/icon-home-single-player.js";
import { IconHomeTournament } from "./components/icons/icon-home-tournament.js";
import { IconShieldCheck } from "./components/icons/icon-shield-check.js";
import { IconSquareArrowUpRight } from "./components/icons/icon-square-arrow-up-right.js";
import { IconUserRound } from "./components/icons/icon-user-round.js";
import { LoginForm } from "./components/login-form.js";
import { ModalLoginMenu } from "./components/modal-login-menu.js";
import { RegisterForm } from "./components/register-form.js";
import { Matchmaking } from "./components/match-making.js";
import { GameRoom } from "./components/game.js";
import { TournamentList } from "./components/tournament-list.js";
import { Tournament } from "./components/tournament.js";
import { Router } from "./router-static.js";
import { UserGameHistory } from "./components/history/user-game-history.js";
import { CollapsedView } from "./components/sidebar/sidebarCollapsed.js";
import { FriendListView } from "./components/sidebar/sidebarFriendList.js";
import { ChatView } from "./components/sidebar/sidebarChat.js";
import { LeaderboardCard } from "./components/leaderboard/leaderboard-card.js";
import { ButtonPasswordReset } from "./components/2fa/button-reset.js";
import { PasswordResetForm } from "./components/settings/password-reset-form.js";
import { Test3d } from "./components/test3d.js";
import { Game3D } from "./components/GameRoom3D.js";

customElements.define('modal-login-menu', ModalLoginMenu)
customElements.define('btn-theme-toggle', ButtonThemeToggle)
customElements.define('btn-2fa', Button2FA)
customElements.define('btn-password-reset', ButtonPasswordReset)
customElements.define('password-reset-form', PasswordResetForm)

// PAGE COMPONENTS
customElements.define('register-form', RegisterForm)
customElements.define('login-form', LoginForm)
customElements.define('play-card', PlayCard)
customElements.define('stats-card', StatsCard)
customElements.define('top-player-card', TopPlayerCard)
customElements.define('user-game-history', UserGameHistory)
customElements.define('leaderboard-card', LeaderboardCard)

// 2FA
customElements.define('two-fa-login-verify', TwoFALoginVerify)
customElements.define('two-fa-register-ga', TwoFARegisterGA)
customElements.define('two-fa-verify-ga', TwoFAVerifyGA)
customElements.define('two-fa-backup-ga', TwoFABackupGA)
customElements.define('two-fa-disable-verify', TwoFADisableVerify)

// Home
customElements.define('home-header', HomeHeader);
customElements.define('home-content', HomeContent);

customElements.define('friends-sidebar', Sidebar);
customElements.define('collapsed-sidebar', CollapsedView);
customElements.define('friendlist-sidebar', FriendListView);
customElements.define('chat-sidebar', ChatView);

// ICONS
customElements.define('icon-check', IconCheck)
customElements.define('icon-chevron-left', IconChevronLeft)
customElements.define('icon-shield-check', IconShieldCheck)
customElements.define('icon-square-arrow-up-right', IconSquareArrowUpRight)
customElements.define('icon-user-round', IconUserRound)
customElements.define('icon-home-single-player', IconHomeSingleplayer)
customElements.define('icon-home-multiplayer', IconHomeMultiplayer)
customElements.define('icon-home-tournament', IconHomeTournament)

// Matchmaking
customElements.define('match-making', Matchmaking)

// Game
customElements.define('game-room', GameRoom)

// Tournament
customElements.define('tournament-list', TournamentList)
customElements.define('tournament-room', Tournament)

customElements.define('test-3d', Test3d)
customElements.define('game-3d', Game3D)

Router.init()
