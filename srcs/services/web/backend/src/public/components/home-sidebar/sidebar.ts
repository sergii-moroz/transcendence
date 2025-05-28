import { API } from "../../api-static.js"
import { Router } from "../../router-static.js";

import { ChatInitResponse, Friend, Messages, SidebarResponse } from "../../../types/user.js";

import {
	iconFriends,
	iconRefresh,
	iconX,
	iconPlus,
	iconArrowLeft,
	iconBlock,
	iconTrash,
	iconChatSend,
	iconSidebarCheck
} from "../icons/icons.js"

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
	
	handleKeyPress(event: KeyboardEvent) {
		const key = event.key;

		if (key === 'Enter') {
			const addFriendinput = document.getElementById('addFriendInput') as HTMLInputElement;
			const chatInput = document.getElementById('chat-input') as HTMLInputElement;
			if (addFriendinput) {
				const name = addFriendinput.value.trim();
				if (name) {
					console.log(`name: ${name}`);
					addFriendinput.value = '';
				}
			}
			else if (chatInput) {
				const message = chatInput.value.trim();
				if (message) {
					console.log(`Chat message: ${message}`);
					chatInput.value = '';
				}
			}
		}
	}

	async handleClick(event: Event) {
		const target = event.target as HTMLElement;

		if (target.closest('#sideBar-collapsed') || target.closest('#back-to-friends-btn')) {
			this.state = 'friendList';
			this.openChatwith = null;
			this.renderOpen();
			this.initFriends();
		}
		else if (target.closest('#refresh-friends-btn')) {
			this.initFriends();
		}
		else if (target.closest('#close-social-btn')) {
			this.state = 'collapsed'
			this.renderCollapsed();
		}
		else if (target.closest('#addFriendBTN')) {
			const input = document.getElementById('addFriendInput') as HTMLInputElement;
			const name = input!.value.trim();
			if (name) {
				console.log(name);
				input.value = '';
			}
		}
		else if (target.closest('#acceptFriendReq')) {
			alert('accept friend request');
		}
		else if (target.closest('#declineFriendReq')) {
			alert('decline friend request');
		}
		else if (target.closest('.friend-item')) {
			const friendField = target.closest('.friend-item') as HTMLElement;
			const name = friendField.dataset.friendName!;

			this.state = 'chat';
			this.initChat(name);
		}
		else if (target.closest('#unfriend-btn')) {
			alert('delete friend');
		}
		else if (target.closest('#block-btn')) {
			alert('block friend');
		}
		else if (target.closest('#send-message-btn')) {
			const chatInput = document.getElementById('chat-input') as HTMLInputElement;
			const message = chatInput.value.trim();
			if (message) {
				console.log(`Chat message: ${message}`);
				chatInput.value = '';
			}
		}
		else if (target.closest('#invite-to-game-btn')) {
			if (!this.querySelector('#game-invitations-container'))
				alert('invited to game');
			else
				alert('there is already an invitation!');

		}
		else if (target.closest('#acceptGameInvite-btn')) {
			alert('accept game invite');
		}
		else if (target.closest('#declineGameInvite-btn')) {
			alert('decline game invite');
		}
		else if (target.closest('#chatProfile-btn')) {
			alert('show friend profile');
		}
	}

	renderCollapsed() {
		this.innerHTML = `
			<div id="sideBar-collapsed" class="w-16 h-screen right-0 dark:bg-gray-800 bg-white border-l dark:border-gray-700 border-gray-200 flex flex-col items-center py-6 cursor-pointer dark:hover:bg-gray-700/50 hover:bg-white/70 transition-colors">
				<div class="mb-6">
					${iconFriends}
				</div>
				<div class="w-10 h-10 dark:bg-gray-700 bg-gray-100 rounded-full mb-3 relative">
					<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 dark:border-gray-800 border-white"></div>
				</div>
				<div class="w-10 h-10 dark:bg-gray-700 bg-gray-100 rounded-full mb-3 relative">
					<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 dark:border-gray-800 border-white"></div>
				</div>
				<div class="w-10 h-10 dark:bg-gray-700 bg-gray-100 rounded-full mb-3 relative">
					<div class="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 dark:border-gray-800 border-white"></div>
				</div>
				<div class="mt-auto text-xs text-gray-400 [writing-mode:vertical-rl] [text-orientation:mixed] rotate-180">
					FRIENDS
				</div>
			</div>
		`;
	}

	renderOpen() {
		this.innerHTML = `
			<div id="sidebar-friends" class="w-80 h-screen right-0 dark:bg-gray-800 bg-white border-l dark:border-gray-700 border-gray-200 flex flex-col">
				<div class="p-4 flex justify-between items-center">
					<h2 class="text-lg font-bold flex items-center">
						<span class="mr-2">${iconFriends}</span>
						Friends
					</h2>
					<div class="flex items-center gap-2">
						<button id="refresh-friends-btn" class="text-gray-400 dark:hover:text-white hover:text-gray-500  p-1" title="Refresh Friends">
							${iconRefresh}
						</button>
						<button id="close-social-btn" class="text-gray-400 dark:hover:text-white hover:text-gray-500 p-1">
							${iconX}
						</button>
					</div>
				</div>
				
				<!-- Add friend -->
				<div class="p-4 border-b border-t dark:border-gray-700 border-gray-200">
					<div class="relative">
					<input id="addFriendInput" type="text" placeholder="Add friend..." class="w-full dark:bg-gray-700 bg-gray-100 border-none rounded-lg pl-3 pr-10 py-2 text-sm placeholder-gray-400 focus:ring-blue-500 focus:ring-2 duration-300 hover:scale-[1.02] hover:shadow-lgmake">
					<button id="addFriendBTN" class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:hover:text-white hover:text-gray-500">
						${iconPlus}
					</button>
					</div>
				</div>

				<!-- Content Container -->
				<div class="flex flex-col h-full overflow-y-auto">
					<div id="friendInvite" class="flex-shrink-0"></div>
					<div id="friendList" class="flex-shrink-0"></div>
				</div>
			</div>
		`;
	}

	showErrorState(element: HTMLElement | null) {
		if (!element) return;
		element.innerHTML = `
		<div class="flex items-center justify-center h-full min-h-screen">
		<h2 class="text-red-500">Failed to load data</h2>
			</div>
		`;
	}

	addRequests(data: SidebarResponse) {
		const root = this.querySelector('#friendInvite');
		if (!root) return;
		root.innerHTML = '';

		if (data.FriendRequests.length > 0) {
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
	
			data.FriendRequests.forEach((request: Friend) => {
				const requestElement = document.createElement('div');
				requestElement.className = 'dark:bg-gray-700 bg-gray-100 rounded-3xl shadow-sm p-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg';
				requestElement.innerHTML = `
					<div class="flex items-center justify-between">
						<div id="friendRequestProfile" class="flex items-center gap-2 cursor-pointer">
							<img 
								src="${request.picture}"
								onerror="this.src='/uploads/default.jpg'"
								class="w-10 h-10 rounded-full object-cover"
							>
							<span class="font-medium">${request.name}</span>
						</div>
						<div class="flex gap-2">
							<button id="acceptFriendReq" class="p-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors">
								${iconSidebarCheck}
							</button>
							<button id="declineFriendReq" class="p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors">
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

	addOnlineFriends(data: SidebarResponse, root: Element) {
		const online = document.createElement('div');
		online.innerHTML = `
			<div class="p-4 border-b dark:border-gray-700 border-gray-200">
				<h3 class="text-xs font-bold text-gray-400 mb-3">ONLINE • ${data.friends.online.length}</h3>
				<div id="insertContainer" class="space-y-2"></div>
			</div>
		`;
	
		const requestsContainer = online.querySelector('#insertContainer');
	
		data.friends.online.forEach((friend: Friend) => {
		// data.friends.online.forEach((friend: Friend & {unreadMessages: boolean}) => {
			const requestElement = document.createElement('div');
			requestElement.className = "friend-item flex items-center p-2 rounded-lg dark:hover:bg-gray-700 hover:bg-gray-100 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg";
			requestElement.dataset.friendName = friend.name;
			requestElement.innerHTML = `
				<div class="relative mr-3">
					<img 
						src=${friend.picture}
						onerror="this.src='/uploads/default.jpg'"
						class="w-10 h-10 rounded-full"
					>
					<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 dark:border-gray-800 border-white"></div>
				</div>
				<span class="font-medium">${friend.name}</span>
			`;
			// <!-- ${friend.unreadMessages ? '  <div class="w-2 h-2 ml-3 bg-blue-500 rounded-full" title="unread Messages"></div>' : ''} -->
			requestsContainer!.appendChild(requestElement);
		})
		root.append(online);
	}

	addOfflineFriends(data: SidebarResponse, root: Element) {
		const offline = document.createElement('div');
		offline.innerHTML = `
			<div class="p-4">
				<h3 class="text-xs font-bold text-gray-400 mb-3">OFFLINE • ${data.friends.offline.length}</h3>
				<div id="insertContainer" class="space-y-2"></div>
			</div>
		`;
	
		const requestsContainer = offline.querySelector('#insertContainer');
		data.friends.offline.forEach((friend: Friend) => {
		// data.friends.offline.forEach((friend: Friend & {unreadMessages: boolean}) => {
			const requestElement = document.createElement('div');
			requestElement.className = "friend-item flex items-center p-2 rounded-lg dark:hover:bg-gray-700 hover:bg-gray-100 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg";
			requestElement.innerHTML = `
				<div class="relative mr-3">
					<img 
						src=${friend.picture}
						onerror="this.src='/uploads/default.jpg'"
						class="w-10 h-10 rounded-full"
					>
					<div class="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 dark:border-gray-800 border-white"></div>
				</div>
				<span class="font-medium">${friend.name}</span>
			`;
			// ${friend.unreadMessages ? '  <div class="w-2 h-2 ml-3 bg-blue-500 rounded-full" title="unread Messages"></div>' : ''}
			requestsContainer!.appendChild(requestElement);
		});
		root.append(offline);
	}

	addFriends(data: SidebarResponse) {
		const root = this.querySelector('#friendList');
		if (!root) return;
		root.innerHTML = '';

		this.addOnlineFriends(data, root);
		this.addOfflineFriends(data, root);
	}

	renderChat(data: ChatInitResponse) {
		this.innerHTML = `
			<div id="sidebar-chat" class="w-80 h-screen right-0 dark:bg-gray-800 bg-white border-l dark:border-gray-700 border-gray-200 flex flex-col">
				<!-- Friend header -->
				<div  class="p-4 border-b dark:border-gray-700 border-gray-200 flex justify-between items-center">
					<div id='chatProfile-btn' class="flex items-center cursor-pointer">
						<img 
							src=${data.friend.picture}
							onerror="this.src='/uploads/default.jpg'"
							class="w-10 h-10 rounded-full mr-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
						>
						<div>
							<div class="font-medium">
								${data.friend.name}
							</div>
							<div class="text-xs text-gray-400">${data.friend.onlineState}</div>
						</div>
					</div>
					
					<div class="flex items-center gap-2">
						<button id="block-btn" class="text-gray-400 hover:text-red-500 p-1" title="Block User">
							${iconBlock}
						</button>
						<button id="unfriend-btn" class="text-gray-400 hover:text-red-500 p-1" title="Unfriend">
							${iconTrash}
						</button>
						<button id="back-to-friends-btn" class="text-gray-400 hover:text-gray-500 p-1">
							${iconArrowLeft}
						</button>
					</div>
				</div>
				
				<!-- Game invite button -->
				<div class="p-4 border-b dark:border-gray-700 border-gray-200">
					<button id="invite-to-game-btn" class="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-medium py-2 rounded-lg transition-colors flex items-center justify-center duration-300 hover:scale-[1.02] hover:shadow-lg">
						Invite to Game
					</button>
				</div>
				
				<!-- Game invitations section -->
				<div id="game-invitations-section" class=""></div>
			
				<!-- Chat messages -->
				<div id="friend-chat-messages" class="flex-1 overflow-y-auto p-4 space-y-3 dark:bg-gray-700/25 bg-gray-50"></div>
			
				<!-- Chat input -->
				<div id="InputBar" class="p-4 border-t dark:border-gray-700 border-gray-200">
					<div class="relative">
					<input id="chat-input" type="text" placeholder="Type a message..." class="w-full dark:bg-gray-700 bg-gray-100 border-none rounded-lg pl-3 pr-10 py-2 text-sm placeholder-gray-400 focus:ring-blue-500 focus:ring-2 duration-300 hover:scale-[1.02] hover:shadow-lg">
					<button id="send-message-btn" class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500">
						${iconChatSend}
					</button>
					</div>
				</div>
			</div>
		`
	}

	addGameInvitation() {
		const root = this.querySelector('#game-invitations-section');
		if (!root) return;
		const invitation = document.createElement('div');
		invitation.classList = "p-4 border-b dark:border-gray-700 border-gray-200";
		invitation.innerHTML = `
			<h3 class="font-bold text-lg mb-3 pb-2">
				Game Invitation
			</h3>
			<div id="game-invitations-container" class="space-y-3">
				<div class="dark:bg-gray-700 bg-gray-100 rounded-3xl shadow-sm p-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
					<div class="flex items-center justify-between">
						<div class="pl-3">
							<span class="font-medium">1v1</span>
							<!-- <div class="text-xs text-gray-400">30s remaining</div> -->
						</div>
						<div class="flex gap-2">
							<button id="acceptGameInvite-btn" class="p-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors">
								${iconSidebarCheck}
							</button>
							<button id="declineGameInvite-btn" class="p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors">
								${iconX}
							</button>
						</div>
					</div>
				</div>
			</div>
		`
		root.append(invitation)
	}

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

	addMessages(name: string) {
		const root = this.querySelector('#friend-chat-messages');
		if (!root || !this.messages || !name) return;
		this.messages.forEach(message => {
			const messageElement = document.createElement('div');
			if (message.owner == name)
				messageElement.classList = "w-fit max-w-[70%] rounded-2xl rounded-bl-none dark:bg-blue-200 bg-blue-100 border border-blue-200 text-blue-800 p-2";
			else
				messageElement.classList = "ml-auto w-fit max-w-[70%] rounded-2xl rounded-br-none bg-blue-600 border border-blue-700 text-white p-2";
			messageElement.innerHTML = `
				<p class="text-sm text-left break-all">${message.text}</p>
			`
			root.append(messageElement);
		})


		requestAnimationFrame(() => {
			root.lastElementChild!.scrollIntoView({ behavior: 'smooth' });
		});
	}
}