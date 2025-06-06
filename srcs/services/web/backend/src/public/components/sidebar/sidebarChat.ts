import { ChatInitResponse, Message } from "../../../types/user.js";
import { API } from "../../api-static.js";
import { iconSidebarCheck, iconX } from "../icons/icons.js";
import { Sidebar } from "./sidebarBase.js";
import { SidebarTemplates } from "./sidebarTemplates.js";


export async function loadChat(sidebar: Sidebar) {
	try {
		const data = await API.getInitChatData(sidebar.openChatwith!) as ChatInitResponse;
		if (!data) {
			console.error("Error fetching chat init data");
			return sidebar.showErrorState(sidebar.querySelector('#sidebar-chat'));
		}
		renderChat(sidebar, data);
		setBlockButton(sidebar, data.friend.blocked);
		if (data.gameInvite)
			addGameInvitation(sidebar);
		data.messages?.forEach(message => addMessages(sidebar, message));
	} catch (error) {
		console.error("Error fetching chat init data:", error);
		sidebar.showErrorState(sidebar.querySelector('#sidebar-chat'));
	}
}

export function addMessages(sidebar: Sidebar, message: Message) {
	const root = sidebar.querySelector('#friend-chat-messages');
	if (!root || !sidebar.openChatwith) return;

	const messageElement = document.createElement('div');
	if (message.owner == sidebar.openChatwith)
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

function renderChat(sidebar: Sidebar, data: ChatInitResponse) {
	sidebar.innerHTML = SidebarTemplates.chat(data);
}

function setBlockButton(sidebar: Sidebar, blocked: string | null) {
	const block = sidebar.querySelector('#block-btn') as HTMLElement;
	const unblock = sidebar.querySelector('#unblock-btn') as HTMLElement;
	if (blocked)
		block.classList.add("hidden");
	else
		unblock.classList.add("hidden");
}

function addGameInvitation(sidebar: Sidebar) {
		const root = sidebar.querySelector('#game-invitations-section');
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
							<button id="rejectGameInvite-btn" class="p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors">
								${iconX}
							</button>
						</div>
					</div>
				</div>
			</div>
		`
		root.append(invitation)
	}