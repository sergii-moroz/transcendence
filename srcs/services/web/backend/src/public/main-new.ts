import { TwoFABackupGA } from "./components/2fa/2fa-backup-ga.js";
import { TwoFALoginVerify } from "./components/2fa/2fa-login-verify.js";
import { TwoFARegisterGA } from "./components/2fa/2fa-register-ga.js";
import { TwoFAVerifyGA } from "./components/2fa/2fa-verify-ga.js";
import { ButtonThemeToggle } from "./components/button-theme-toggle.js";
import { IconCheck } from "./components/icons/icon-check.js";
import { IconChevronLeft } from "./components/icons/icon-chevron-left.js";
import { IconSquareArrowUpRight } from "./components/icons/icon-square-arrow-up-right.js";
import { LoginForm } from "./components/login-form.js";
import { ModalLoginMenu } from "./components/ModalLoginMenu.js";
import { RegisterForm } from "./components/register-form.js";
import { Router } from "./router-static.js";

customElements.define('modal-login-menu', ModalLoginMenu)
customElements.define('btn-theme-toggle', ButtonThemeToggle)

// PAGE COMPONENTS
customElements.define('register-form', RegisterForm)
customElements.define('login-form', LoginForm)

// 2FA
customElements.define('two-fa-login-verify', TwoFALoginVerify)
customElements.define('two-fa-register-ga', TwoFARegisterGA)
customElements.define('two-fa-verify-ga', TwoFAVerifyGA)
customElements.define('two-fa-backup-ga', TwoFABackupGA)

// ICONS
customElements.define('icon-square-arrow-up-right', IconSquareArrowUpRight)
customElements.define('icon-chevron-left', IconChevronLeft)
customElements.define('icon-check', IconCheck)

Router.init()
