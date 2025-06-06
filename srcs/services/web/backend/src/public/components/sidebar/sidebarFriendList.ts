import { Friend, SidebarResponse } from "../../../types/user.js";
import { API } from "../../api-static.js";
import { iconCheck, iconX } from "../icons/icons.js";
import { Sidebar } from "./sidebarBase.js";
import { SidebarTemplates } from "./sidebarTemplates.js";


export async function loadFriendList(sidebar: Sidebar) {
	try {
		const data = await API.getFriendList();
		if (!data) {
			console.error(`Error fetching friends data`);
			return sidebar.showErrorState(sidebar.querySelector('#friendList'));
		}
		renderFriendList(sidebar);
		addRequests(sidebar, data);
		addFriends(sidebar, data);
	} catch (error) {
		console.error("Error fetching friends data:", error);
		sidebar.showErrorState(sidebar.querySelector('#friendList'));
	}
}

function renderFriendList(sidebar: Sidebar) {
	sidebar.innerHTML = SidebarTemplates.friendList();
}

function addFriends(sidebar: Sidebar, data: SidebarResponse) {
	const root = sidebar.querySelector('#friendList');
	if (!root) return;
	root.innerHTML = '';

	addOnlineFriends(data, root);
	addOfflineFriends(data, root);
}

function addRequests(sidebar: Sidebar, data: SidebarResponse) {
	const root = sidebar.querySelector('#friendInvite');
	if (!root) return;
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

function addOnlineFriends(data: SidebarResponse, root: Element) {
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

function addOfflineFriends(data: SidebarResponse, root: Element) {
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