export const renderProfile = (profile) => (
	`
		<h2>Profile</h2>
		<p><strong>Username:</strong> ${profile.username}</p>
		<p><strong>Bio:</strong> ${profile.bio}</p>
		<a href="/home" id="home-link">Back</a>
	`
)
