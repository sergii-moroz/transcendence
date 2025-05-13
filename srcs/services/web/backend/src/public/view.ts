import { Api } from "./api.js";
import { Router } from "./router.js";

import { eventListenerObject } from "./types.js";

export class View {
	element: HTMLElement;
	eventListeners: eventListenerObject[];
	api: Api;
	router: Router;
	socket: WebSocket | null;

	constructor(api: Api, router: Router) {
		this.element = document.createElement('div');
		this.eventListeners = [];

		this.api = api;
		this.router = router;
		this.socket = null;
	}

	setContent(input: Record<string, any>) {
		this.element.innerHTML = '<h1>Base View. SHOULD BE OVERWRITTEN</h1>';
	}

	mount = async (parent: HTMLElement) => {
		parent.innerHTML = '';

		const input = await this.prehandler();
		// console.log(`input: ${input}`);
		this.setContent(input);
		parent.append(this.element);
		this.setupEventListeners();
	}

	async prehandler(): Promise<Record<string, any>> 
	{
		// Should be overridden by subclasses if needed
		return {};
	}

	setupEventListeners() {
		// Should be overridden by subclasses if needed
	}

	addEventListener(element: HTMLElement | Window | Document, type: string, handler: (e: Event | KeyboardEvent) => void)
	{
		element.addEventListener(type, handler);
		this.eventListeners.push({element, type, handler});
	}

	unmount = () => {
		this.cleanupEventListeners();
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.close();
			console.log('Disconnected from WebSocket...');
		}

		if (this.element.parentElement) {
			this.element.remove();
		}
	}

	cleanupEventListeners() {
		this.eventListeners.forEach( ({element, type, handler}) => {
			element.removeEventListener(type, handler);
		});
		this.eventListeners = [];
	}
}
