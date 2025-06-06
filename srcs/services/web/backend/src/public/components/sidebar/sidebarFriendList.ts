import { Friend, SidebarResponse } from "../../../types/user.js";
import { API } from "../../api-static.js";
import { iconCheck, iconX } from "../icons/icons.js";
import { showErrorState } from "./sidebarBase.js";
import { SidebarTemplates } from "./sidebarTemplates.js";


export class FriendListView extends HTMLElement {
	el_close: HTMLElement | null = null;
	el_backdrop: HTMLElement | null = null;
	el_refresh: HTMLElement | null = null;
	el_addFriend: HTMLElement | null = null;
	el_addFriendInput: HTMLInputElement | null = null;
	// el_acceptFriend: HTMLElement | null = null;
	// el_rejectFriend: HTMLElement | null = null;


	constructor() {
		super();
		this.render();
	}

	async connectedCallback() {		
		this.el_close = this.querySelector('#close-btn');
		this.el_backdrop = this.querySelector('#backdrop');
		this.el_refresh = this.querySelector('#refresh-friends-btn');
		this.el_addFriend = this.querySelector('#addFriendBTN');
		this.el_addFriendInput = this.querySelector('#addFriendInput') as HTMLInputElement;
	
		this.el_close?.addEventListener('click', this.switchToCollapseSidebar);
		this.el_backdrop?.addEventListener('click', this.switchToCollapseSidebar);
		this.el_refresh?.addEventListener('click', this.loadFriendList);
		this.el_addFriend?.addEventListener('click', this.addFriend);
		this.el_addFriendInput?.addEventListener('keydown', this.addFriend);
		this.addEventListener('click', this.handleDynamicContent);

		await this.loadFriendList();
	}
	
	disconnectedCallback() {
		this.el_close?.removeEventListener('click', this.switchToCollapseSidebar);
		this.el_backdrop?.removeEventListener('click', this.switchToCollapseSidebar);
		this.el_refresh?.removeEventListener('click', this.loadFriendList);
		this.el_addFriend?.removeEventListener('click', this.addFriend);
		this.el_addFriendInput?.removeEventListener('keydown', this.addFriend);
		this.removeEventListener('click', this.handleDynamicContent);
	}

	loadFriendList = async () => {
		try {
			const data = await API.getFriendList();
			if (!data.success) throw Error(`fetching friendList data failed: ${data.message}`);
			this.appendRequests(data);
			this.appendFriends(data);
		} catch (error) {
			console.error("Error loading friendList View: ", error);
			showErrorState(this.querySelector('#friendList'));
		}
	}

	render() {
		this.innerHTML = SidebarTemplates.friendList();
	}

	appendFriends(data: SidebarResponse) {
		const root = this.querySelector('#friendList');
		if (!root) throw new Error('render must have failed');
		root.innerHTML = '';

		this.appendOnlineFriends(data, root);
		this.appendOfflineFriends(data, root);
	}

	appendRequests(data: SidebarResponse) {
		const root = this.querySelector('#friendInvite');
		if (!root) throw new Error('render must have failed');
		root.innerHTML = '';

		if (data.friendRequests.length > 0) {
			const element = document.createElement('div');
			element.innerHTML = `
				<div class="p-4 border-b dark:border-gray-700 border-gray-200">
					<h3 class="font-bold text-lg mb-3 pb-2">
						Friend  Requests
					</h3>
					<div id="insertContainer" class="space-y-3"></div>
				</div>
			`;

			const requestsContainer = element.querySelector('#insertContainer');

			data.friendRequests.forEach((request: Friend) => {
				const requestElement = document.createElement('div');
				requestElement.className = 'dark:bg-gray-700 bg-gray-100 rounded-3xl shadow-sm p-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg';
				requestElement.innerHTML = `
					<div class="flex items-center justify-between">
						<div id="friendRequestProfile" class="flex items-center gap-2 cursor-pointer">
							<img 
								src="${request.picture}"
								class="w-10 h-10 rounded-full object-cover"
							>
							<span class="font-medium">${request.name}</span>
						</div>
						<div class="flex gap-2">
							<button id="acceptFriendReq" class="p-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors" data-friend-name=${request.name}>
								${iconCheck}
							</button>
							<button id="rejectFriendReq" class="p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors" data-friend-name=${request.name}>
								${iconX}
							</button>
						</div>
					</div>
				`;
				requestsContainer!.appendChild(requestElement);
			})
			root.append(element);
		}
	}

	appendOnlineFriends(data: SidebarResponse, root: Element) {
		const online = document.createElement('div');
		online.innerHTML = `
			<div class="p-4 border-b dark:border-gray-700 border-gray-200">
				<h3 class="text-xs font-bold text-gray-400 mb-3">ONLINE • ${data.friends.online.length}</h3>
				<div id="insertContainer" class="space-y-2"></div>
			</div>
		`;

		const requestsContainer = online.querySelector('#insertContainer');

		data.friends.online.forEach((friend: Friend) => {
			const requestElement = document.createElement('div');
			requestElement.className = "friend-item flex items-center p-2 rounded-lg dark:hover:bg-gray-700 hover:bg-gray-100 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg";
			requestElement.dataset.friendName = friend.name;
			requestElement.innerHTML = `
				<div class="relative mr-3">
					<img 
						src=${friend.picture}
						class="w-10 h-10 rounded-full"
					>
					<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 dark:border-gray-800 border-white"></div>
				</div>
				<span class="font-medium">${friend.name}</span>
			`;
			requestsContainer!.appendChild(requestElement);
		})
		root.append(online);
	}

	appendOfflineFriends(data: SidebarResponse, root: Element) {
		const offline = document.createElement('div');
		offline.innerHTML = `
			<div class="p-4">
				<h3 class="text-xs font-bold text-gray-400 mb-3">OFFLINE • ${data.friends.offline.length}</h3>
				<div id="insertContainer" class="space-y-2"></div>
			</div>
		`;

		const requestsContainer = offline.querySelector('#insertContainer');
		data.friends.offline.forEach((friend: Friend) => {
			const requestElement = document.createElement('div');
			requestElement.className = "friend-item flex items-center p-2 rounded-lg dark:hover:bg-gray-700 hover:bg-gray-100 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg";
			requestElement.dataset.friendName = friend.name;
			requestElement.innerHTML = `
				<div class="relative mr-3">
					<img 
						src=${friend.picture}
						class="w-10 h-10 rounded-full"
					>
					<div class="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 dark:border-gray-800 border-white"></div>
				</div>
				<span class="font-medium">${friend.name}</span>
			`;
			requestsContainer!.appendChild(requestElement);
		});
		root.append(offline);
	}

	handleDynamicContent = (event: Event) => {
		const target = event.target as HTMLElement;

		const friend = target.closest('.friend-item') as HTMLElement | null;
		if (friend) this.switchToChatSidebar(friend);

		const acceptFriend = target.closest('#acceptFriendReq') as HTMLElement | null;
		if (acceptFriend) this.acceptFriend(acceptFriend);

		const rejectFriend = target.closest('#rejectFriendReq') as HTMLElement | null;
		if (rejectFriend) this.acceptFriend(rejectFriend);
	}

	switchToChatSidebar = (friend: HTMLElement) => {
		const name = friend.dataset.friendName;
		this.dispatchEvent(new CustomEvent('state-change', {
			detail: {state: 'chat', name},
			bubbles: true
		}))
	}

	switchToCollapseSidebar = () => {
		this.dispatchEvent(new CustomEvent('state-change', {
			detail: {state: 'collapsed'},
			bubbles: true
		}))
	}

	rejectFriend = async (inviter: HTMLElement) => {
		const name = inviter.dataset.friendName;
		const res = await API.rejectFriend(name!);
		if (!res.success) {
			console.error(`rejecting friend invite failed: ${res.message}`);
		}
		this.loadFriendList();
	}

	acceptFriend = async (inviter: HTMLElement) => {
		const name = inviter.dataset.friendName;
		const res = await API.acceptFriend(name!);
		if (!res.success) {
			console.error(`accepting friend invite failed: ${res.message}`);
		}
		this.loadFriendList();
	}

	addFriend = async (event: Event) => {
		if (event instanceof KeyboardEvent && event.key !== 'Enter') return;
		const name = this.el_addFriendInput?.value.trim();
		if (name) {
			const res = await API.addFriend(name);
			if (!res.success) {
				console.error(`adding friend failed: ${res.message}`);
			}
			this.el_addFriendInput!.value = '';
		}
	}
}