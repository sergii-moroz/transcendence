import { View } from "../view.js"

export class ProfileView extends View {
	setContent = (profile: Record<string, any>) => {
		this.element.innerHTML = `
			<h2>Profile</h2>
			<p><strong>Username:</strong> ${profile.username}</p>
			<p><strong>Bio:</strong> ${profile.bio}</p>
			<a href="/home" data-link>Back</a>
		`;
	}

	async prehandler(): Promise<Record<string, any> | null>  {
		const res = await this.api.getProfile();
		return (res);
	}
}
