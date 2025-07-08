import { Router } from "./router-static.js";
import { MessageToServer } from "../types/user.js";
import { popupManager } from "./popupManager.js";

class SocialSocketHandler {
	private socket: WebSocket | null = null;
	private messageCallback: ((data: any) => void) | null = null;

	init() {
		if (this.socket) return;
		this.socket = new WebSocket("/ws/chat");

		this.socket.onopen = () => {
			console.log('social Socket got connected');
		}

		this.socket.onmessage = (messageBuffer: MessageEvent) => {
			try {
				const data = JSON.parse(messageBuffer.data);
				if (data.type == 'chatMessage' || data.type == 'chatGameInvite') {
					const callback = this.messageCallback || popupManager.addPopup;
					callback(data)
				}
				else if (data.type == 'tournamentNextGame' || data.type == 'tournamentInfo') {
					if (!window.location.pathname.includes('/tournament/'))
						popupManager.addPopup(data);
					console.log('tournament message received');
				}
				else if (data.type == 'error') {
					console.error(data.text);
					popupManager.addPopup(data);
				}
			} catch (error) {
				console.error("message receiving or processing failed: ", error);
			}
		}

		this.socket.onclose = async (event: CloseEvent) => {
			console.log('social Socket closed');
			this.socket = null;
			if (event.code === 1000) {
				await Router.logout();
				alert('User is already signed in!');
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

}

export const socialSocketManager = new SocialSocketHandler();