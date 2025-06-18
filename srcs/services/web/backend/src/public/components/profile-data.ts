import { API } from "../api-static.js";
import { profileData } from "../types/game-history.types.js";
import { icon2FA, iconCalendar, iconCamera, iconChange, iconHomeStats, iconLockClose } from "./icons/icons.js"
import { showErrorState } from "./sidebar/sidebarBase.js";



export class ProfileData extends HTMLElement {
	username: string;
	maxSizeMB: number = 5;

	changeAvatar: HTMLInputElement | null = null;
	Avatar: HTMLImageElement | null = null;

	constructor() {
		super()
		const pathParts = window.location.pathname.split("/");
		this.username = pathParts[pathParts.length - 1];
		this.innerHTML = ' <div class="tw-card p-6 h-full w-full><h2 class="flex items-center justify-center">Loading...</h2></div.'
	}

	async connectedCallback() {
		await this.loadProfile();

		this.changeAvatar = this.querySelector('#changeAvatar');
		this.Avatar = this.querySelector('#avatar');

		this.changeAvatar?.addEventListener('change', this.handleAvatarChange);
	}

	disconnectedCallback() {
		this.changeAvatar?.removeEventListener('change', this.handleAvatarChange);
	}

	handleEvent(event: Event) {

	}

	handleAvatarChange = async (event: Event) => {
		try {
			const files = this.changeAvatar?.files;
			if (files?.length !== 1) return alert('wrong amount of images selected');
			const file = files[0];
			if (file.size > this.maxSizeMB * 1024 * 1024) return alert(`file size too large. Must be smaller than ${this.maxSizeMB}mb`);
	
			const data = await API.uploadNewAvatar(file);
			if (!data.success) throw Error(`upload failed: ${data.message}`);
			if (this.Avatar)
				this.Avatar.src = data.url;
		} catch (err) {
			console.error("changing avatar failed: ", err);
			showErrorState(this.querySelector('#parentContainer'));
		}
	}

	async loadProfile() {
		try {
			const data = await API.getProfileData(this.username);
			if (!data.success) throw Error(`fetching profileData failed: ${data.message}`);
			this.render(data);
		} catch (error) {
			console.error("Error loading profileData View: ", error);
			showErrorState(this.querySelector('#parentContainer'));
		}
	}

	private render(data: profileData) {
		this.innerHTML = `
			<div id='parentContainer' class="tw-card p-6">
				<div class="flex items-center mb-6">
					<div class="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center mr-4">
						${iconHomeStats}
					</div>
					<h3 class="text-xl font-bold">Profile Data</h3>
				</div>

				<div class="flex p-4 space-x-6">
					<div class="flex flex-col">
						<div class="relative group">
							<div class="size-40 overflow-hidden rounded-full border-4 border-white dark:border-gray-300 bg-gray-200 shadow-lg">
								<img
									id="avatar"
									src=${data.avatar} 
									class="h-full w-full object-cover" 
								/>
							</div>
							<div class="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
								${iconCamera}
							</div>
							<input type="file" id="changeAvatar" accept="image/jpeg, image/png, image/jpg" class="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
							<div class="absolute bottom-3 right-3 size-5 bg-green-500 border-3 border-white dark:border-gray-300 rounded-full"></div>
						</div>
					</div>

					<div class="flex flex-col space-y-4">
						<div class="space-y-0.5">
							<label class="block whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">Username</label>
							<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 lowercase">${data.username}</h2>
						</div>

						<div class="space-y-0.5">
							<label class="block whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">Favorite Animal</label>
							<div class="flex">
								<p class="text-gray-700 dark:text-gray-200">${data.funFact}</p>
								<button class="ml-2 text-gray-400 dark:text-gray-500 hover:text-blue-500">
								${iconChange}
								</button>
							</div>
						</div>

						<div class="space-y-0.5">
							<label class="block whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">Registered Since</label>
							<p class="flex items-center text-gray-700 dark:text-gray-100 whitespace-nowrap">
								${iconCalendar}
								${new Date(data.registerDate).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'short',
									day: 'numeric'
								})}
							</p>
						</div>
					</div> 
				</div>

				<div class='pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3'>
					<button class="flex items-center justify-center rounded-lg whitespace-nowrap bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2 text-blue-600 dark:text-blue-300  transition-colors w-full">
						${iconLockClose}
						Change Password
					</button>
					<button class="flex items-center justify-center rounded-lg whitespace-nowrap bg-green-500/10 hover:bg-green-500/20 px-4 py-2 text-green-600 dark:text-green-300 transition-colors w-full">
						${icon2FA}
						Enable 2FA
					</button>
				</div> 
			</div>
		`
	}
}
