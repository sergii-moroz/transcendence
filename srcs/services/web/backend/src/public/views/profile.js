import { View } from "../view.js"

export class ProfileView extends View {
	setContent = (profile) => {
		this.element.innerHTML = `
			<h2>Profile</h2>
			<p><strong>Username:</strong> ${profile.username}</p>
			<p><strong>Bio:</strong> ${profile.bio}</p>
			<a href="/home" data-link>Back</a>
		`;
	}

	async prehandler() {
		const res = await this.api.getProfile();

		if (!res.ok) {
			return this.router.navigateTo('/home');
		}

		const { profile } = await res.json();

		return (profile);
	}
}
