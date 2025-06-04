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

		this.socket.onclose = (event: CloseEvent) => {
			if (event.code === 1000)
				alert('User is already signed in!');
			console.log('social Socket closed');
			this.socket = null;
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

	addPopup = (message: Message) => {
		// something
		console.log(`new message from ${message.owner}: ${message.text}, popup`);
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