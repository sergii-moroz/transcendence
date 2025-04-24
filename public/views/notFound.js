import { View } from "../view.js"

export class NotFoundView extends View {
    getContent() {
        this.element.classList.add('not-found-view');
        
        this.element.innerHTML = `
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <a href="/home" data-link>Back to Home</a>
        `;
    }
}
