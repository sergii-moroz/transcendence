import { ChatInitResponse, Message } from "../../../types/user.js";
import { API } from "../../api-static.js";
import { socialSocketManager } from "../../socialWebSocket.js";
import { iconSidebarCheck, iconX } from "../icons/icons.js";
import { showErrorState, Sidebar } from "./sidebarBase.js";
import { SidebarTemplates } from "./sidebarTemplates.js";


export class ChatView extends HTMLElement {
	name: string = '';

	el_back: HTMLElement | null = null;
	el_backdrop: HTMLElement | null = null;
	el_unfriend: HTMLElement | null = null;
	el_block: HTMLElement | null = null;
	el_unblock: HTMLElement | null = null;
	el_sendMSG: HTMLElement | null = null;
	el_chatInput: HTMLInputElement | null = null;
	el_inputField: HTMLElement | null = null;
	el_inviteBTN: HTMLElement | null = null;
	el_friendProfile: HTMLElement | null = null;
	el_gameInvitationSection: HTMLElement | null = null;
	el_gameInviteButtonSection: HTMLElement | null = null;

	constructor() {
		super();
		this.render();
	}

	async connectedCallback() {
		this.name = this.getAttribute('friend') || '';
		socialSocketManager.setMessageCallback((data: Message) => {
			if (data.owner != this.name)
				return socialSocketManager.addPopup(data);
			this.addMessages(data);
		});

		this.el_back = this.querySelector('#back-to-friends-btn');
		this.el_backdrop = this.querySelector('#backdrop');
		this.el_unfriend = this.querySelector('#unfriend-btn');
		this.el_block = this.querySelector('#block-btn');
		this.el_unblock = this.querySelector('#unblock-btn');
		this.el_sendMSG = this.querySelector('#send-message-btn');
		this.el_chatInput = this.querySelector('#chat-input') as HTMLInputElement;
		this.el_inviteBTN = this.querySelector('#invite-to-game-btn');
		this.el_inputField = this.querySelector('#inputField');
		this.el_friendProfile = this.querySelector('#chatProfile-btn');
		this.el_gameInvitationSection = this.querySelector('#game-invitations-section');
		this.el_gameInviteButtonSection = this.querySelector('#gameInviteButtonSection');

		this.el_back?.addEventListener('click', this.switchToFriendListSidebar);
		this.el_backdrop?.addEventListener('click', this.switchToCollapseSidebar);
		this.el_unfriend?.addEventListener('click', this.unfriend);
		this.el_block?.addEventListener('click', this.block);
		this.el_unblock?.addEventListener('click', this.unblock);
		this.el_sendMSG?.addEventListener('click', this.sendMessage);
		this.el_chatInput?.addEventListener('keydown', this.sendMessage);
		this.el_inviteBTN?.addEventListener('click', this.gameInvitation);
		this.el_friendProfile?.addEventListener('click', this.switchToProfilePage);
		this.addEventListener('click', this.handleDynamicContent);

		await this.loadChat();
	}
	
	disconnectedCallback() {
		socialSocketManager.removeMessageCallback();

		this.el_back?.removeEventListener('click', this.switchToFriendListSidebar);
		this.el_backdrop?.removeEventListener('click', this.switchToCollapseSidebar);
		this.el_unfriend?.removeEventListener('click', this.unfriend);
		this.el_block?.removeEventListener('click', this.block);
		this.el_unblock?.removeEventListener('click', this.unblock);
		this.el_sendMSG?.removeEventListener('click', this.sendMessage);
		this.el_chatInput?.removeEventListener('keydown', this.sendMessage);
		this.el_inviteBTN?.removeEventListener('click', this.gameInvitation);
		this.el_friendProfile?.removeEventListener('click', this.switchToProfilePage);
		this.removeEventListener('click', this.handleDynamicContent);
	}

	loadChat = async () => {
		try {
			if (!this.name) throw new Error("friend is undefined");
			const data = await API.getInitChatData(this.name);
			if (!data.success) throw new Error(`fetching chatInit data failed: ${data.message}`);
			this.setProfileInfo(data);
			this.setBlockButton(data.friend.blocked);
			if (data.gameInvite)
				this.addGameInvitation();
			const messageRoot = this.querySelector('#friend-chat-messages') as HTMLElement;
			messageRoot.innerHTML = '';
			data.messages?.forEach((message: Message) => this.addMessages(message, messageRoot));
		} catch (error) {
			console.error("Error loading Chat View: ", error);
			showErrorState(this.querySelector('#sidebar-chat'));
		}
	}

	render() {
		this.innerHTML = SidebarTemplates.chat();
	}

	addMessages(message: Message, root?: HTMLElement) {
		if (!root) root = this.querySelector('#friend-chat-messages')! as HTMLElement;
		if (!root || !this.name) throw new Error('render must have failed');

		const messageElement = document.createElement('div');
		if (message.owner == this.name)
			messageElement.classList = "w-fit max-w-[70%] rounded-2xl rounded-bl-none dark:bg-blue-200 bg-blue-100 border border-blue-200 text-blue-800 p-2";
		else
			messageElement.classList = "ml-auto w-fit max-w-[70%] rounded-2xl rounded-br-none bg-blue-600 border border-blue-700 text-white p-2";
		messageElement.innerHTML = `
			<p class="text-sm text-left break-all">${message.text}</p>
		`
		root.append(messageElement);


		requestAnimationFrame(() => {
			root.lastElementChild!.scrollIntoView();
		});
	}

	setBlockButton(blocked: string | null) {
		if (blocked) {
			this.el_block!.classList.add("hidden");
			this.el_unblock!.classList.remove("hidden");
			this.el_inputField?.classList.add("hidden");
			this.el_gameInvitationSection?.classList.add("hidden");
			this.el_gameInviteButtonSection?.classList.add("hidden");
		}
		else {
			this.el_unblock!.classList.add("hidden");
			this.el_block!.classList.remove("hidden");
			this.el_inputField?.classList.remove("hidden");
			this.el_gameInvitationSection?.classList.remove("hidden");
			this.el_gameInviteButtonSection?.classList.remove("hidden");
		}
	}

	addGameInvitation() {
		if (!this.el_gameInvitationSection) throw new Error('render must have failed');
		this.el_gameInvitationSection.innerHTML = '';
		
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
							<button id="rejectGameInvite-btn" class="p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors">
								${iconX}
							</button>
						</div>
					</div>
				</div>
			</div>
		`
		this.el_gameInvitationSection.append(invitation)
	}

	setProfileInfo(data: ChatInitResponse) {
		const root = this.querySelector('#chatProfile-btn');
		if (!root) throw new Error('render must have failed');
		root.innerHTML = '';
		
		const div = document.createElement('div');
		div.classList = "flex items-center";
		div.innerHTML = `
			<img 
				src=${data.friend.picture}
				class="w-10 h-10 rounded-full mr-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
			>
			<div>
				<div class="font-medium">
					${data.friend.name}
				</div>
				<div class="text-xs text-gray-400">${data.friend.online ? "online" : "offline"}</div>
			</div>
		`
		root.append(div);
	}

	handleDynamicContent = (event: Event) => {
		const target = event.target as HTMLElement;

		const acceptGameInvite = target.closest('#acceptGameInvite-btn') as HTMLElement | null;
		if (acceptGameInvite) this.acceptGameInvite();

		const rejectGameInvite = target.closest('#rejectGameInvite-btn') as HTMLElement | null;
		if (rejectGameInvite) this.rejectGameInvite();
	}

	switchToProfilePage = async () => {
		alert("will be added");
	}

	switchToCollapseSidebar = () => {
		this.dispatchEvent(new CustomEvent('state-change', {
			detail: {state: 'collapsed'},
			bubbles: true
		}))
	}

	switchToFriendListSidebar = () => {
		this.dispatchEvent(new CustomEvent('state-change', {
			detail: {state: 'friendList'},
			bubbles: true
		}))
	}

	acceptGameInvite = async () => {
		alert("will be added");
	}

	rejectGameInvite = async () => {
		alert("will be added");
	}

	gameInvitation = async () => {
		if (this.querySelector('#game-invitations-container')) {
			alert('there is already an invitation!');
			return;
		}
		alert("will be added");
	}

	sendMessage = (event: Event) => {
		if (event instanceof KeyboardEvent && event.key !== 'Enter') return;
		const message = this.el_chatInput?.value.trim();
		if (message) {
			socialSocketManager.send({text: message, to: this.name});
			this.addMessages({text: message, owner: "you"});
			this.el_chatInput!.value = '';
		}
	}

	block = async () => {
		if (this.name == "admin")
			return alert("cant block admin user!");
		const res = await API.blockFriend(this.name);
		if (!res.success) {
			console.error(`blocking friend failed: ${res.message}`);
			return;
		}
		this.el_block!.classList.toggle("hidden");
		this.el_unblock!.classList.toggle("hidden");
		this.el_inputField?.classList.add("hidden");
		this.el_gameInvitationSection?.classList.add("hidden");
		this.el_gameInviteButtonSection?.classList.add("hidden");
	}

	unblock = async () => {
		const res = await API.unblockFriend(this.name);
		if (!res.success) {
			console.error(`unblocking friend failed: ${res.message}`);
		}
		this.loadChat();
	}

	unfriend = async () => {
		if (this.name == "admin")
			return alert("cant delete admin user from friends!");
		if (confirm("Are you sure you want to delete sidebar friend?")) {
			const res = await API.deleteFriend(this.name);
			if (!res.success) {
				console.error(`deleting friend failed: ${res.message}`);
			}
			this.switchToFriendListSidebar();
		}
	}
}