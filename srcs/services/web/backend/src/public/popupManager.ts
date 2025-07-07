import { iconHomeTrophy } from "./components/icons/icons.js";
import { Router } from "./router-static.js";

export interface PopupData {
  type: 'chatMessage' | 'chatGameInvite' | 'tournamentNextGame' | 'tournamentInfo' | 'error';
  owner?: string;
  message?: string;
  opponentName?: string;
  gameRoomId?: string;
  dismissTime?: number;
}

class popupHandler {
	private root: HTMLElement | null = null; 
	private autoDismiss: NodeJS.Timeout | null = null;
	init() {
		console.log('popup Manager initilized')
		this.root = document.getElementById('popup')!;
		this.root.addEventListener('click', this.clickHandler);
		// this.addPopup({
		// 	type: 'error',
		// 	message: 'ohoh'
		// 	// owner: 'paul'
		// 	// opponentName: 'paul'
		// })
		
	}

	clickHandler = (e: Event) => {
		const target = e.target as HTMLElement;

		const closeBtn = target.closest('#close-btn') as HTMLElement | null;
		if (closeBtn) {
			this.dismissPopup();
		}

		const joinGameInvite = target.closest('#acceptGameInviteInPopup') as HTMLElement | null;
		if (joinGameInvite) {
			const gameID = joinGameInvite.getAttribute('gameRoomId');
			if (gameID && confirm('are you sure you want to go there now?')) {
				Router.navigateTo(`/game/${gameID}`);
				this.dismissPopup()
			}
		}

		const joinTournament = target.closest('#acceptJoiningNextTournamentGame') as HTMLElement | null;
		if (joinTournament) {
			const gameID = joinTournament.getAttribute('gameRoomId');
			if (gameID && confirm('are you sure you want to go there now?')) {
				Router.navigateTo(`/game/${gameID}`);
				this.dismissPopup()
			}
		}
	}

	dismissPopup = () => {
		if (!this.root) return;
		if (this.autoDismiss) {
			clearTimeout(this.autoDismiss);
			this.autoDismiss = null;
		}
		const popup = this.root.querySelector('#popupDiv');
		if (popup) {
			popup.classList.remove('animate-slide-in');
			popup.classList.add('animate-slide-out');
			popup.addEventListener('animationend', () => {
				this.root!.innerHTML = '';
			}, { once: true });
		}
	}

	addPopup = (data: PopupData) => {
		this.dismissPopup(); //delete existing popup
		this.addToast(data);
	}

	addToast = (data: PopupData) => {
		if (!this.root) return;

		const notificationType = this.getPopupType(data)
		if (!notificationType) return alert('popup failed')
		this.root.innerHTML = `
			<div id='popupDiv' class="fixed top-2 left-1/2 w-[90%] md:max-w-md md:mt-4 z-100 bg-white/85 dark:bg-gray-800/85 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-400/20 overflow-hidden animate-slide-in">
				<!-- Notification Header -->
				<div class="flex items-center justify-between px-4 py-2">
					<div class="flex items-center space-x-3">
						<div class="size-8 ${notificationType?.color} rounded-lg flex items-center justify-center">
							${notificationType?.icon}
						</div>	

						<div class="flex flex-col">
							<div class="text-sm font-semibold text-gray-900 dark:text-gray-100">${notificationType?.title}</div>
							<div class="text-sm text-gray-700 dark:text-gray-300">${notificationType?.message}</div>
						</div>

						</div>
					<div class="flex items-center gap-2">
						${notificationType?.button}
						<button id='close-btn' class="text-gray-400 hover:text-gray-600 transition-colors">
							<svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		`;

		const autoDismissTime = data.dismissTime || notificationType.defaultDismissTime;
		this.autoDismiss = setTimeout(() => {
			this.autoDismiss = null;
			this.dismissPopup();
		}, autoDismissTime);
	}

	getPopupType = (data: PopupData) => {
		switch (data.type) {
			case 'chatMessage':
				if (!data.owner) return null;
				return {
					color: 'bg-blue-500',
					icon: ` <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-white">
								<path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
							</svg>
							`,
					title: 'Chat Message',
					message: `New Message from ${data.owner}`,
					button: '',
					defaultDismissTime: 5000
				}
			case 'chatGameInvite':
				if (!data.owner) return null;
				return {
					color: 'bg-purple-500',
					icon: `	<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-white">
								<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
							</svg>
							`,
					title: 'Game Invite',
					message: `${data.owner} invited you to play a 1v1`,
					button: `<button id='acceptGameInviteInPopup' class="action-btn px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors" gameRoomId=${data.gameRoomId}>
								Accept
							</button>`,
					defaultDismissTime: 5000
				}
			case 'tournamentNextGame':
				if (!data.opponentName) return null;
				return {
					color: 'bg-indigo-500',
					icon: `	<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-white">
								<path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
							</svg>
							`,
					title: 'Next Matchup',
					message: `Your next tournament game against ${data.opponentName} is ready`,
					button: `<button id="acceptJoiningNextTournamentGame" class="action-btn px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg transition-colors" gameRoomId=${data.gameRoomId}>
								Play
							 </button>`,
					defaultDismissTime: 5000
				}
			case 'tournamentInfo':
				if (!data.message) return null;
				return {
					color: 'bg-amber-500',
					icon: `	<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-white">
								<path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
							</svg>
							`,
					title: 'Tournament Info',
					message: `${data.message || ''}`,
					button: '',
					defaultDismissTime: 5000
				}
			case 'error':
				if (!data.message) return null;
				return {
					color: 'bg-red-500',
					icon: `	<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-white">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
							</svg>
							`,
					title: 'Error',
					message: `${data.message || 'some error occurred'}`,
					button: '',
					defaultDismissTime: 6500
				}
		}
	}
}

export const popupManager = new popupHandler();