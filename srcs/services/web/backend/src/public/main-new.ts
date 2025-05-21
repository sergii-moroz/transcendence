import { ModalLoginMenu } from "./components/modalLoginMenu.js";
import { ButtonThemeToggle } from "./components/ButtonThemeToggle.js";
import { Router } from "./router-static.js";

customElements.define('modal-login-menu', ModalLoginMenu)
customElements.define('btn-theme-toggle', ButtonThemeToggle)

Router.init()
