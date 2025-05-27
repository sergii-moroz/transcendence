import { API } from "../../api-static.js"
import { Router } from "../../router-static.js";

export class HomeContent extends HTMLElement {
	data: any;
	loaded: boolean;

	constructor() {
		super()
		this.loaded = false;
		this.innerHTML = '<div class="flex items-center justify-center h-full min-h-screen"> <h2>loading...</h2></div>';
	}

	
	async fetchData() {
		try {
			this.data = await API.getHome();
			if (!this.data) {
				this.showErrorState();
			}
			this.loaded = true;
			this.render();
		} catch (error) {
			console.error("Error fetching Home data:", error);
			this.showErrorState();
		}
	}
	
	connectedCallback() {
		this.fetchData();
		this.addEventListener('click', this.handleClick);
	}
	
	disconnectedCallback() {
		this.removeEventListener('click', this.handleClick);
	}
	
	async handleClick(event: Event) {
		const target = event.target as HTMLElement;

		if (target.closest('#singleplayer-btn')) {
			alert('not available');
		}
		else if (target.closest('#multiplayer-btn')) {
			Router.navigateTo('/waiting-room');
		}
		else if (target.closest('#tournament-btn')) {
			alert('not available');
		}
		else if (target.closest('#viewProfile-btn')) {
			Router.navigateTo('/settings');
		}
		else if (target.closest('#viewLeaderboard-btn')) {
			Router.navigateTo('/about');
		}
	}

	render() {
		if (!this.loaded) return;
		this.innerHTML = ``;
	}

	showErrorState() {
		this.innerHTML = `
		<div class="flex items-center justify-center h-full min-h-screen">
		<h2 class="text-red-500">Failed to load data</h2>
			</div>
		`;
	}
}