export const renderLogin = () => (
	`
	<h2>Login</h2>
	<form id="loginForm">
		<input name="username" placeholder="Username" required><br>
		<input type="password" name="password" placeholder="Password" required><br>
		<button>Login</button>
	</form>
	<p><a href="/register" id="register-nav">Register</a></p>
	`
)
