import { Sidebar } from "./sidebarBase.js";
import { Message } from "../../../types/user.js";
import { API } from "../../api-static.js";
import { addMessages, loadChat } from "./sidebarChat.js";
import { loadFriendList } from "./sidebarFriendList.js";
import { SidebarTemplates } from "./sidebarTemplates.js";
import { socialSocketManager } from "../../socialWebSocket.js";

export function handleKeyPress(sidebar: Sidebar, key: string) {
	if (key === 'Enter') {
		const addFriendinput = document.getElementById('addFriendInput') as HTMLInputElement;
		const chatInput = document.getElementById('chat-input') as HTMLInputElement;
		if (addFriendinput) addFriend(addFriendinput);
		else if (chatInput) sendMessage(sidebar, chatInput);
	}
}

export async function handleClick(sidebar: Sidebar, target: HTMLElement) {
	if (target.closest('#sideBar-collapsed')) {
		changeToFriendList(sidebar)
	}
	else if (target.closest('#back-to-friends-btn')) {
		socialSocketManager.removeMessageCallback();
		sidebar.openChatwith = null;
		changeToFriendList(sidebar);
	}
	else if (target.closest('#refresh-friends-btn')) {
		loadFriendList(sidebar);
	}
	else if (target.closest('#close-social-btn') || target.closest('#sidebar-backdrop')) {
		changeToCollapsed(sidebar);
	}
	else if (target.closest('#addFriendBTN')) {
		const input = document.getElementById('addFriendInput') as HTMLInputElement;
		if (input) addFriend(input);
	}
	else if (target.closest('#acceptFriendReq')) {
		const name = (target.closest('#acceptFriendReq') as HTMLElement).dataset.friendName;
		const res = await API.acceptFriend(name!);
		if (!res.success) {
			console.error(`accepting friend invite failed: ${res.message}`);
		}
		loadFriendList(sidebar);
	}
	else if (target.closest('#rejectFriendReq')) {
		const name = (target.closest('#rejectFriendReq') as HTMLElement).dataset.friendName;
		const res = await API.rejectFriend(name!);
		if (!res.success) {
			console.error(`rejecting friend invite failed: ${res.message}`);
		}
		loadFriendList(sidebar);
	}
	else if (target.closest('.friend-item')) {
		const name = (target.closest('.friend-item') as HTMLElement).dataset.friendName;
		changeToChat(sidebar, name!);
	}
	else if (target.closest('#unfriend-btn')) {
		if (sidebar.openChatwith == "admin")
			return alert("cant delete admin user from friends!");
		if (confirm("Are you sure you want to delete sidebar friend?")) {
			const res = await API.deleteFriend(sidebar.openChatwith!);
			if (!res.success) {
				console.error(`deleting friend failed: ${res.message}`);
			}
			sidebar.openChatwith = null;
			changeToFriendList(sidebar);
		}
	}
	else if (target.closest('#block-btn')) {
		if (sidebar.openChatwith == "admin")
			return alert("cant block admin user!");
		const res = await API.blockFriend(sidebar.openChatwith!);
		if (!res.success) {
			console.error(`blocking friend failed: ${res.message}`);
			return;
		}
		const block = sidebar.querySelector('#block-btn') as HTMLElement;
		const unblock = sidebar.querySelector('#unblock-btn') as HTMLElement;
		block.classList.add("hidden");
		unblock.classList.remove("hidden");
	}
	else if (target.closest('#unblock-btn')) {
		const res = await API.unblockFriend(sidebar.openChatwith!);
		if (!res.success) {
			console.error(`unblocking friend failed: ${res.message}`);
		}
		loadChat(sidebar);
	}
	else if (target.closest('#send-message-btn')) {
		const chatInput = document.getElementById('chat-input') as HTMLInputElement;
		if (chatInput) sendMessage(sidebar, chatInput);
	}
	else if (target.closest('#invite-to-game-btn')) {
		if (!sidebar.querySelector('#game-invitations-container'))
			alert('invited to game');
		else
			alert('there is already an invitation!');

	}
	else if (target.closest('#acceptGameInvite-btn')) {
		alert('accept game invite');
	}
	else if (target.closest('#rejectGameInvite-btn')) {
		alert('reject game invite');
	}
	else if (target.closest('#chatProfile-btn')) {
		alert('show friend profile');
	}
}

export function renderCollapsed(sidebar: Sidebar) {
	sidebar.innerHTML = SidebarTemplates.collapsed();
}

function sendMessage(sidebar: Sidebar, chatInput: HTMLInputElement) {
	const message = chatInput.value.trim();
	if (message) {
		// console.log(`Chat message: ${message}`);
		socialSocketManager.send({text: message, to: sidebar.openChatwith!});
		addMessages(sidebar, {text: message, owner: "you"});
		chatInput.value = '';
	}
}

async function addFriend(input: HTMLInputElement) {
		const name = input.value.trim();
		if (name) {
			const res = await API.addFriend(name);
			if (!res.success) {
				console.error(`adding friend failed: ${res.message}`);
			}
			input.value = '';
		}
	}

function changeToCollapsed(sidebar: Sidebar) {
	sidebar.state = 'collapsed'
	renderCollapsed(sidebar);
}

export function changeToFriendList(sidebar: Sidebar) {
	sidebar.state = 'friendList';
	loadFriendList(sidebar);
}

function changeToChat(sidebar: Sidebar, name: string) {
	sidebar.state = 'chat';
	sidebar.openChatwith = name!;
	socialSocketManager.setMessageCallback((data: Message) => {
		if (data.owner != sidebar.openChatwith)
			return socialSocketManager.addPopup(data);
		addMessages(sidebar, data);
	});
	loadChat(sidebar);
}