import { SidebarTemplates } from "./sidebarTemplates.js";

export class CollapsedView extends HTMLElement {
	container: HTMLElement | null = null;


	constructor() {
		super();
		this.render();
	}

	connectedCallback() {
		this.container = this.querySelector('#sideBar-collapsed');

		this.container?.addEventListener('click', this.switchToFriendListSidebar)
	}
	
	disconnectedCallback() {
		this.container?.removeEventListener('click', this.switchToFriendListSidebar)
	}

	switchToFriendListSidebar = () => {
		this.dispatchEvent(new CustomEvent('state-change', {
			detail: {state: 'friendList'},
			bubbles: true
		}))
	}

	render() {
		this.innerHTML = SidebarTemplates.collapsed();
	}
}