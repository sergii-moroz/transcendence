import { TwoFARegisterGA } from "./components/2fa/2fa-register-ga.js";
import { ButtonThemeToggle } from "./components/ButtonThemeToggle.js";
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
customElements.define('two-fa-register-ga', TwoFARegisterGA)

// ICONS
customElements.define('icon-chevron-left', IconChevronLeft)
customElements.define('icon-square-arrow-up-right', IconSquareArrowUpRight)

Router.init()
