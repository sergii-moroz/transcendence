import { Router } from "./router-static.js";
import { Message, MessageToServer } from "../types/user.js";

class SocialSocketHandler {
	private socket: WebSocket | null = null;
	private messageCallback: ((data: any) => void) | null = null;

	init() {
		if (this.socket) return;
		this.socket = new WebSocket("/ws/chat");

		this.socket.onopen = () => {
			console.log('social Socket got connected');
		}

		// this.addPopup({owner: 'asd', text: 'asd'});

		this.socket.onmessage = (messageBuffer: MessageEvent) => {
			try {
				const data = JSON.parse(messageBuffer.data);
				if (data.type == 'message') {
					const callback = this.messageCallback || this.addPopup;
					callback(data)
				}
				else if (data.type == 'error')
					console.error(data.text);
			} catch (error) {
				console.error("message receiving or processing failed: ", error);
			}
		}

		this.socket.onclose = async (event: CloseEvent) => {
			console.log('social Socket closed');
			this.socket = null;
			if (event.code === 1000) {
				await Router.logout();
				console.log('Social Socket: User is already signed in!');
			}
		}

		this.socket.onerror = (error: Event) => {
			console.error('social socket had an error. Possibly server shutdown');
			this.socket = null;
		}
	}

	disconnect() {
		if (!this.socket) return;
		this.socket.close();
		this.socket = null;
		console.log('disconnecting social socket')
	}

	setMessageCallback(func: (data: any) => void) {
		this.messageCallback = func;
	}

	removeMessageCallback() {
		this.messageCallback = null;
	}

	send(message: MessageToServer) {
		try {
			if (!this.socket || this.socket.readyState !== WebSocket.OPEN) throw new Error('socket isnt set or isnt ready');
			this.socket.send(JSON.stringify(message));
		} catch (error) {
			console.error('sending message over social socket failed: ', error);
		}
	}

	addPopup = (message: Message) => {
		const root = document.getElementById('popup')!;
		dismissPopup();
		root.innerHTML = `
			<div id='popupDiv' class="fixed top-2 left-1/2 w-[90%] md:max-w-md md:mt-4 z-100 bg-white/85 dark:bg-gray-800/85 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-400/20 overflow-hidden animate-slide-in">
				<!-- Notification Header -->
				<div class="flex items-center justify-between px-4 py-2">
					<div class="flex items-center space-x-3">

						<div class="size-8 bg-blue-500 rounded-lg flex items-center justify-center">
							<svg class="size-6 text-white" fill="currentColor" viewBox="0 0 20 20">
								<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
								<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
							</svg>
						</div>

						<div class="flex flex-col">
							<div class="text-sm font-semibold text-gray-900 dark:text-gray-100">Message</div>
							<div class="text-sm text-gray-700 dark:text-gray-300">New Message from ${message.owner}</div>
						</div>
					</div>
					<button class="text-gray-400 hover:text-gray-600 transition-colors close-btn">
						<svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
						</svg>
					</button>
				</div>
			</div>
		`

		const autoDismiss = setTimeout(() => {
			dismissPopup();
		}, 5000);

		const closeBtn = root.querySelector('.close-btn');
		if (closeBtn) {
			closeBtn.addEventListener('click', () => {
				clearTimeout(autoDismiss);
				dismissPopup();
			});
		}

		function dismissPopup() {
			const popup = root.querySelector('#popupDiv');
			if (popup) {
				popup.classList.remove('animate-slide-in');
				popup.classList.add('animate-slide-out');
				popup.addEventListener('animationend', () => {
					root.innerHTML = '';
				}, { once: true });
			}
		}


		// console.log(`new message from ${message.owner}: ${message.text}, popup`);
	}
}

export const socialSocketManager = new SocialSocketHandler();
