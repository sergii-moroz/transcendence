import { View } from "../view.js"

export class LobbyView extends View {
	setContent = () => {
		this.element.innerHTML = `
			<h1>Nothing - yet </h1>
			<a href="/home" data-link>Back to Home</a>
		`;
	}
}
