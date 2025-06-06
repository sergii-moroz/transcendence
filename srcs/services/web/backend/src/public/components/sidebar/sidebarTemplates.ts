import {
	iconArrowLeft,
	iconChatSend,
	iconFriends,
	iconLockClose,
	iconLockOpen,
	iconPlus,
	iconRefresh,
	iconTrash,
	iconX
} from "../icons/icons.js";


export const SidebarTemplates = {
	collapsed: () => ` 
		<div id="sideBar-collapsed" class="hidden lg:flex z-50 w-16 h-screen fixed right-0 dark:bg-gray-800 bg-white border-l dark:border-gray-700 border-gray-200 flex-col items-center py-6 cursor-pointer dark:hover:bg-gray-700/50 hover:bg-white/70 transition-colors">
			<div class="mb-6 text-blue-400 dark:text-white">
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
		<div class="h-full pr-16 hidden lg:block"></div>
	`,

	friendList: () => `
		<div id="backdrop" 
			class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden">
		</div>

		<div id="sidebar-friends" class="z-50 w-80 h-screen fixed right-0 dark:bg-gray-800 bg-white border-l dark:border-gray-700 border-gray-200 flex flex-col">
			<div class="p-4 flex justify-between items-center">
				<h2 class="text-lg font-bold flex items-center">
					<span class="mr-2">${iconFriends}</span>
					Friends
				</h2>
				<div class="flex items-center gap-2">
					<button id="refresh-friends-btn" class="text-gray-400 dark:hover:text-white hover:text-gray-500  p-1" title="Refresh Friends">
						${iconRefresh}
					</button>
					<button id="close-btn" class="text-gray-400 dark:hover:text-white hover:text-gray-500 p-1">
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
		<div class="h-full pr-80 hidden lg:block"></div>
	`,

	chat: () => `
		<div id="backdrop" 
			class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden">
		</div>

		<div id="sidebar-chat" class="z-50 w-80 h-screen fixed right-0 dark:bg-gray-800 bg-white border-l dark:border-gray-700 border-gray-200 flex flex-col">
			<!-- Friend header -->
			<div  class="p-4 border-b dark:border-gray-700 border-gray-200 flex justify-between items-center">
				<div id='chatProfile-btn' class="cursor-pointer"></div>
				<div class="flex items-center gap-2">
					<button id="block-btn" class="text-gray-400 hover:text-red-500 p-1" title="Block User">
						${iconLockClose}
					</button>
					<button id="unblock-btn" class="text-gray-400 hover:text-red-500 p-1" title="Unblock User">
						${iconLockOpen}
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
			<div id="InputBar" class="p-4 h-[70px] border-t dark:border-gray-700 border-gray-200">
				<div id="inputField" class="relative">
					<input id="chat-input" type="text" placeholder="Type a message..." class="w-full dark:bg-gray-700 bg-gray-100 border-none rounded-lg pl-3 pr-10 py-2 text-sm placeholder-gray-400 focus:ring-blue-500 focus:ring-2 duration-300 hover:scale-[1.02] hover:shadow-lg">
					<button id="send-message-btn" class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500">
						${iconChatSend}
					</button>
				</div>
			</div>
		</div>
		<div class="h-full pr-80 hidden lg:block"></div>
	`
}