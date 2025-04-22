export const renderRegister = () => (
	`
	<h2>Register</h2>
	<form id="registerForm">
		<input name="username" placeholder="Username" required><br>
		<input type="password" name="password" placeholder="Password" required><br>
		<button>Register</button>
	</form>
	<p><a href="/login" id="login-nav">Login</a></p>
	`
)
