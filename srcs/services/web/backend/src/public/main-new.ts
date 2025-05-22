import { ButtonThemeToggle } from "./components/ButtonThemeToggle.js";
import { LoginForm } from "./components/login-form.js";
import { ModalLoginMenu } from "./components/ModalLoginMenu.js";
import { RegisterForm } from "./components/register-form.js";
import { Router } from "./router-static.js";

customElements.define('modal-login-menu', ModalLoginMenu)
customElements.define('btn-theme-toggle', ButtonThemeToggle)
customElements.define('register-form', RegisterForm)
customElements.define('login-form', LoginForm)

Router.init()
