import { View } from "../view.js"

export class AboutView extends View {
    getContent() {
        this.element.classList.add('about-view');
        
        this.element.innerHTML = `
            <h2>About</h2>
		    <p>This SPA uses JWT instead of sessions.</p>
            <a href="/home" data-link>Back to Home</a>
        `;
    }
}
