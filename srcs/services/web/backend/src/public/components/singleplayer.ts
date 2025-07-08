import { Router } from "../router-static.js"
import { API } from "../api-static.js";

export class SinglePlayerRoom extends HTMLElement {

	constructor() {
		super();
	}

	async connectedCallback() {
		const res = await API.getRoomId();
		if (!res.roomId) {
			console.error('SinglePlayerRoom: Error connecting to matchmaking service:', res);
			return;
		}
		console.log('Connected to matchmaking service.');
		Router.navigateTo('/game/' + res.roomId);
	}
}
