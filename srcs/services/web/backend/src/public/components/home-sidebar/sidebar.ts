import { API } from "../../api-static.js"
import { Router } from "../../router-static.js";

import { ChatInitResponse, Friend, Messages, SidebarResponse } from "../../../types/user.js";

export class Sidebar extends HTMLElement {
	state: string;
	openChatwith: string | null;
	messages: Messages[] | null;

	constructor() {
		super()
		this.state = 'collapsed'
		this.openChatwith = null;
		this.messages = null;
	}

	
	async initFriends() {
		try {
			const data = await API.getSidebar() as SidebarResponse;
			if (!data) {
				console.error("Error fetching friends data");
				return this.showErrorState(this.querySelector('#friendList'));
			}
			this.addRequests(data);
			this.addFriends(data);
		} catch (error) {
			console.error("Error fetching friends data:", error);
			this.showErrorState(this.querySelector('#friendList'));
		}
	}
	
	connectedCallback() {
		this.renderCollapsed();
		this.addEventListener('click', this.handleClick);
		this.addEventListener('keydown', this.handleKeyPress);
	}
	
	disconnectedCallback() {
		this.removeEventListener('click', this.handleClick);
		this.removeEventListener('keydown', this.handleKeyPress);
	}
	
	handleKeyPress(event: KeyboardEvent) {}

	async handleClick(event: Event) {}

	renderCollapsed() {
		this.innerHTML = ``;
	}

	renderOpen() {
		this.innerHTML = ``;
	}

	showErrorState(element: HTMLElement | null) {
		if (!element) return;
		element.innerHTML = `
		<div class="flex items-center justify-center h-full min-h-screen">
		<h2 class="text-red-500">Failed to load data</h2>
			</div>
		`;
	}

	addRequests(data: SidebarResponse) {}

	addOnlineFriends(data: SidebarResponse, root: Element) {}

	addOfflineFriends(data: SidebarResponse, root: Element) {}

	addFriends(data: SidebarResponse) {
		const root = this.querySelector('#friendList');
		if (!root) return;
		root.innerHTML = '';

		this.addOnlineFriends(data, root);
		this.addOfflineFriends(data, root);
	}

	renderChat(data: ChatInitResponse) {
		this.innerHTML = ``;
	}

	addGameInvitation() {}

	async initChat(name: string) {
		try {
			const data = await API.getChat(name) as ChatInitResponse;
			if (!data) {
				console.error("Error fetching chat init data");
				return this.showErrorState(this.querySelector('#sidebar-chat'));
			}
			this.renderChat(data);
			if (data.gameInvite)
				this.addGameInvitation();
			this.messages = data.messages;
			this.addMessages(name);
			this.openChatwith = name;
		} catch (error) {
			console.error("Error fetching chat init data:", error);
			this.showErrorState(this.querySelector('#sidebar-chat'));
		}
	}

	addMessages(name: string) {}
}