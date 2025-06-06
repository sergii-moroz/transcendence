import { ChatView } from "./sidebarChat.js";
import { CollapsedView } from "./sidebarCollapsed.js";
import { FriendListView } from "./sidebarFriendList.js";

interface StateChangeEvent {
	state: 'collapsed' | 'friendList' | 'chat';
	name?: string;
}

export class Sidebar extends HTMLElement {
	state: 'collapsed' | 'friendList' | 'chat' = 'collapsed';

	constructor() {
		super()
	}
	
	connectedCallback() {
		this.append(new CollapsedView());

		this.addEventListener('state-change', this.handleChange);
		window.addEventListener('open-sidebar', this.handleChange);
	}
	
	disconnectedCallback() {
		this.removeEventListener('state-change', this.handleChange);
		window.removeEventListener('open-sidebar', this.handleChange);
	}

	handleChange = (event: Event) => {
		const { state, name } = (event as CustomEvent<StateChangeEvent>).detail;

		this.innerHTML = '';
		switch (state) {
			case 'collapsed':
				this.changeState('collapsed');
				this.append(new CollapsedView());
				break;
			case 'friendList':
				this.changeState('friendList');
				this.append(new FriendListView());
				break;
			case 'chat':
				this.changeState('chat');
				const chatView = new ChatView();
				chatView.setAttribute('friend', name!);
				this.append(chatView);
				break;
		}
	}

	changeState(state: "collapsed" | "friendList" | "chat") {
		this.state = state;
		// console.log(`Sidebar: new state: ${this.state}`);
	}
}


export function showErrorState(element: HTMLElement | null) {
	if (!element) return;
	element.innerHTML = `
	<div class="flex items-center justify-center h-full min-h-screen">
	<h2 class="text-red-500">Failed to load data</h2>
		</div>
	`;
}	