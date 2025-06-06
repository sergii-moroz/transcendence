import { socialSocketManager } from "../../socialWebSocket.js";
import {
	changeToFriendList,
	handleClick,
	handleKeyPress,
	renderCollapsed
} from "./sidebarEvents.js";


export class Sidebar extends HTMLElement {
	state: 'collapsed' | 'friendList' | 'chat';
	openChatwith: string | null;

	constructor() {
		super()
		this.state = 'collapsed'
		this.openChatwith = null;
	}

	connectedCallback() {
		renderCollapsed(this);
		this.addEventListener('click', this.handleClick);
		this.addEventListener('keydown', this.handleKeyPress);
		document.addEventListener('trigger-sidebar', this.handleSidebarTrigger);
	}
	
	disconnectedCallback() {
		if (this.openChatwith) {
			socialSocketManager.removeMessageCallback();
			this.openChatwith = null;
		}
		this.removeEventListener('click', this.handleClick);
		this.removeEventListener('keydown', this.handleKeyPress);
		document.removeEventListener('trigger-sidebar', this.handleSidebarTrigger);
	}

	handleClick = (event: Event) => {
		const target = event.target as HTMLElement;
		handleClick(this, target);
	}

	handleKeyPress = (event: KeyboardEvent) => {
		handleKeyPress(this, event.key);
	}

	handleSidebarTrigger = (event: Event) => {
		changeToFriendList(this);
	}

	showErrorState(element: HTMLElement | null) {
		if (!element) return;
		element.innerHTML = `
		<div class="flex items-center justify-center h-full min-h-screen">
		<h2 class="text-red-500">Failed to load data</h2>
			</div>
		`;
	}	
}