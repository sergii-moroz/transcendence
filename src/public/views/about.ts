import { View } from "../view.js"

export class AboutView extends View {
	setContent = () => {
		this.element.innerHTML = `
			<h2>About</h2>
			<p>This SPA uses JWT instead of sessions.</p>
			<a href="/home" data-link>Back to Home</a>
		`;
	}
}
