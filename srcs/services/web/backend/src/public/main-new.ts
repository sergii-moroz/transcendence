import { TwoFABackupGA } from "./components/2fa/2fa-backup-ga.js";
import { TwoFALoginVerify } from "./components/2fa/2fa-login-verify.js";
import { TwoFARegisterGA } from "./components/2fa/2fa-register-ga.js";
import { TwoFAVerifyGA } from "./components/2fa/2fa-verify-ga.js";
import { Button2FA } from "./components/2fa/button-2fa.js";
import { ButtonThemeToggle } from "./components/button-theme-toggle.js";
import { HomeContent } from "./components/home-sidebar/content.js";
import { HomeHeader } from "./components/home-sidebar/header.js";
import { IconCheck } from "./components/icons/icon-check.js";
import { IconChevronLeft } from "./components/icons/icon-chevron-left.js";
import { IconShieldCheck } from "./components/icons/icon-shield-check.js";
import { IconSquareArrowUpRight } from "./components/icons/icon-square-arrow-up-right.js";
import { IconUserRound } from "./components/icons/icon-user-round.js";
import { LoginForm } from "./components/login-form.js";
import { ModalLoginMenu } from "./components/modal-login-menu.js";
import { RegisterForm } from "./components/register-form.js";
import { Router } from "./router-static.js";

customElements.define('modal-login-menu', ModalLoginMenu)
customElements.define('btn-theme-toggle', ButtonThemeToggle)
customElements.define('btn-2fa', Button2FA)

// PAGE COMPONENTS
customElements.define('register-form', RegisterForm)
customElements.define('login-form', LoginForm)

// 2FA
customElements.define('two-fa-login-verify', TwoFALoginVerify)
customElements.define('two-fa-register-ga', TwoFARegisterGA)
customElements.define('two-fa-verify-ga', TwoFAVerifyGA)
customElements.define('two-fa-backup-ga', TwoFABackupGA)

// Home
customElements.define('home-header', HomeHeader);
customElements.define('home-content', HomeContent);


// ICONS
customElements.define('icon-check', IconCheck)
customElements.define('icon-chevron-left', IconChevronLeft)
customElements.define('icon-shield-check', IconShieldCheck)
customElements.define('icon-square-arrow-up-right', IconSquareArrowUpRight)
customElements.define('icon-user-round', IconUserRound)

Router.init()
