import { View } from "../view.js"

export class RegisterView extends View {
    getContent() {
        this.element.classList.add('register-view');
        
        this.element.innerHTML = `
        <h2>Register</h2>
        <form id="registerForm">
            <input name="username" placeholder="Username" required><br>
            <input type="password" name="password" placeholder="Password" required><br>
            <button>Register</button>
        </form>
        <p><a href="/login" data-link>Login</a></p>
        `;
    }

    setupEventListeners() {
        const form = document.getElementById('registerForm');

        const submitHandler = async (e) => {
            e.preventDefault();
            const { username, password } = e.target;
            const res = await this.api.register(username.value, password.value)
    
            if (!res) {
                alert('registration failed');
                return;
            }
            const data = await res.json();
            if (res.ok) {
                return this.router.navigateTo('/login');
            } else {
                alert(data.error);
                return;
            }
        }
        this.addEventListener(form, 'submit', submitHandler);
    }
}
