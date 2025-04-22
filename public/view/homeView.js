export const renderHome = (username) => (
	`
		<h2>Home</h2>
		<p>Welcome, ${username}</p>
		<nav>
			<a href="/about" id="about-link">About</a> |
			<a href="/profile" id="profile-link">Profile</a> |
			<button id="logout">Logout</button>
		</nav>
	`
)
