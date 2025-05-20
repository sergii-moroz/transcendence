import { IconChevronLeft } from "./components/iconChevronLeft.js";
import { Login2FAVerifyForm } from "./components/login-2fa-verify-form.js";
import { LoginForm } from "./components/loginForm.js";
import { Router } from "./router-static.js";

customElements.define('login-form', LoginForm)
customElements.define('icon-chevron-left', IconChevronLeft)
customElements.define('login-2fa-verify-form', Login2FAVerifyForm)

Router.init()
