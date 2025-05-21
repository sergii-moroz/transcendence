import { ButtonThemeToggle } from "./components/ButtonThemeToggle.js";
import { ModalLoginMenu } from "./components/ModalLoginMenu.js";
import { Router } from "./router-static.js";

customElements.define('modal-login-menu', ModalLoginMenu)
customElements.define('btn-theme-toggle', ButtonThemeToggle)

Router.init()
