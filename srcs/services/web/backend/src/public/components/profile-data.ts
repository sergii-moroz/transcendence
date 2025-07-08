import { API } from "../api-static.js";
import { Router } from "../router-static.js";
import { profileData } from "../types/game-history.types.js";
import { iconCalendar, iconCamera, iconChange, iconHomeSingleplayer, iconSidebarCheck, iconX } from "./icons/icons.js"



export class ProfileData extends HTMLElement {
	username: string;
	maxSizeMB: number = 5;

	changeAvatar: HTMLInputElement | null = null;
	avatar: HTMLImageElement | null = null;
	changeBtn: HTMLElement | null = null;
	cancelBtn: HTMLElement | null = null;
	submitBtn: HTMLElement | null = null;
	funFactInput: HTMLInputElement | null = null;
	submitContainer: HTMLElement | null = null;
	displayContainer: HTMLElement | null = null;
	parentContainer: HTMLElement | null = null;
	funFact: HTMLElement | null = null;


	constructor() {
		super()
		const pathParts = window.location.pathname.split("/");
		this.username = pathParts[pathParts.length - 1];
		this.innerHTML = `
			<div class="tw-card p-6 h-full w-full flex flex-col">
				<div class="flex items-center mb-6">
					<div class="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center mr-4 text-blue-400">
						${iconHomeSingleplayer}
					</div>
					<h3 class="text-xl font-bold whitespace-nowrap">Profile Data</h3>
				</div>
				<div id="parentContainer" class="flex-1 flex flex-col h-full">
					<div class="flex-1 flex p-4 items-center justify-center">
						<h2>Loading...</h2>
					</div>
				</div>
			</div>
		`
	}

	async connectedCallback() {
		this.parentContainer = this.querySelector('#parentContainer');
		await this.loadProfile();

		this.changeAvatar = this.querySelector('#changeAvatar');
		this.avatar = this.querySelector('#avatar');
		this.cancelBtn = this.querySelector('#cancel-btn');
		this.changeBtn = this.querySelector('#change-btn');
		this.submitBtn = this.querySelector('#submit-btn');
		this.submitContainer = this.querySelector('#submitContainer');
		this.displayContainer = this.querySelector('#displayContainer');
		this.funFactInput = this.querySelector('#funFactInput');
		this.funFact = this.querySelector('#funFact');

		this.changeAvatar?.addEventListener('change', this.handleAvatarChange);
		this.cancelBtn?.addEventListener('click', this.changeToDisplay);
		this.changeBtn?.addEventListener('click', this.changeToSubmit);
		this.submitBtn?.addEventListener('click', this.handleFunFactSubmit);
	}

	disconnectedCallback() {
		this.changeAvatar?.removeEventListener('change', this.handleAvatarChange);
		this.cancelBtn?.removeEventListener('click', this.changeToDisplay);
		this.changeBtn?.removeEventListener('click', this.changeToSubmit);
		this.submitBtn?.removeEventListener('click', this.handleFunFactSubmit);
	}

	handleEvent(event: Event) {

	}

	handleFunFactSubmit = async (e: Event) => {
		try {
			const input = this.funFactInput?.value.trim();
			if (input) {
				const data = await API.updateFunFact(input);
				if (!data.success) throw new Error('updating FunFact failed')
				this.funFactInput!.value = '';
				this.funFactInput!.blur();
				this.funFact!.innerText = input;
				this.changeToDisplay(e);
			}
		} catch (error) {
			console.error(error);
		}
	}

	changeToDisplay = (e: Event) => {
		this.submitContainer!.classList.replace("flex", "hidden");
		this.displayContainer!.classList.replace("hidden", "flex");
	}

	changeToSubmit = (e: Event) => {
		this.submitContainer!.classList.replace("hidden", "flex");
		this.displayContainer!.classList.replace("flex", "hidden");
	}

	handleAvatarChange = async (event: Event) => {
		try {
			const files = this.changeAvatar?.files;
			if (files?.length !== 1) return alert('wrong amount of images selected');
			const file = files[0];
			if (file.size > this.maxSizeMB * 1024 * 1024) return alert(`file size too large. Must be smaller than ${this.maxSizeMB}mb`);

			const data = await API.uploadNewAvatar(file);
			if (!data.success) throw Error(`upload failed: ${data.message}`);
			if (this.avatar) {
				const imgUrl = new URL(data.url, window.location.origin);
				imgUrl.searchParams.set('t', Date.now().toString());
				this.avatar.src = imgUrl.toString();
			}
		} catch (err) {
			console.error("changing avatar failed: ", err);
			// this.querySelector('#parentContainer')!.innerHTML = '<h2 class="text-red-500 justify-center">Error</h2>';
		}
	}

	async loadProfile() {
		try {
			const data = await API.getProfileData(this.username);
			if (!data.success) throw Error(`fetching profileData failed: ${data.message}`);
			this.render(data);
		} catch (error) {
			console.error("Error loading profileData View: ", error);
			this.parentContainer!.innerHTML = 	`<div class="flex-1 flex p-4 items-center justify-center">
													<h2 class="text-red-500">Error loading data</h2>
												</div>`

		}
	}

	private render(data: profileData) {
		const isOwner = Router.username === this.username;
		this.parentContainer!.innerHTML = `
				<div class="flex p-4 space-x-6 justify-center">
					<div class="flex flex-col">
						<div class="relative group">
							<div class="size-36 sm:size-40 overflow-hidden rounded-full border-4 border-white dark:border-gray-300 bg-gray-200 shadow-lg">
								<img
									id="avatar"
									src=${data.avatar}
									class="h-full w-full object-cover"
								/>
							</div>
							<div class="absolute inset-0 ${isOwner ? 'flex' : ' hidden'} items-center justify-center rounded-full bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
								${iconCamera}
								<input type="file" id="changeAvatar" accept="image/jpeg, image/png, image/jpg" class="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
							</div>
							<div class="absolute bottom-3 right-3 size-5 ${data.online ? 'bg-green-500 ': 'bg-red-500'} border-3 border-white dark:border-gray-300 rounded-full"></div>
						</div>
					</div>

					<div class="flex flex-col space-y-4">
						<div class="space-y-0.5">
							<label class="block whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">Username</label>
							<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 lowercase">${data.username}</h2>
						</div>

						<div class="space-y-0.5">
							<label class="block whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">Favorite Animal</label>
							<div id='displayContainer' class="flex">
								<p id="funFact" class="text-gray-700 dark:text-gray-200">${data.funFact}</p>
								<button id='change-btn' class="${isOwner ? '' : 'hidden'} ml-2 text-gray-400 dark:text-gray-500 hover:text-blue-500">
									${iconChange}
								</button>
							</div>
							<div id='submitContainer' class="hidden items-center mt-2">
								<input
									id='funFactInput'
									type="text"
									value="${data.funFact}"
									class="px-2 py-1 w-30 h-6 text-sm text-gray-700 dark:text-gray-200 bg-gray-50 hover:bg-blue-50 dark:bg-gray-700 dark:hover:bg-blue-900/50 border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
								/>
								<button id="submit-btn"
									class="size-6 p-1 ml-2 flex items-center justify-center text-black dark:text-white bg-white dark:bg-gray-700 border border-black dark:border-gray-200 hover:text-blue-500 rounded-full transition"
								>
									${iconSidebarCheck}
								</button>
								<button id="cancel-btn"
									class="size-6 p-1 ml-1 flex items-center justify-center text-black dark:text-white bg-white dark:bg-gray-700 border border-black dark:border-gray-200 hover:text-red-500 rounded-full transition"
								>
									${iconX}
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

				<div class='${isOwner ? 'flex flex-col' : 'hidden'} mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2'>
					<btn-password-reset></btn-password-reset>
					<btn-2fa></btn-2fa>
				</div>
			</div>
		`
	}
}
