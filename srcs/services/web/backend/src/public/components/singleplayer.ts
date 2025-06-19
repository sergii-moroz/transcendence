import { Router } from "../router-static.js"
import { API } from "../api-static.js";

export class SinglePlayerRoom extends HTMLElement {

	constructor() {
		super();
	}

	async connectedCallback() {
		const res = await API.getRoomId();
		if (!res.roomId) {
			console.error('Error connecting to matchmaking service:', res);
			alert('Error connecting to matchmaking service. Please try again later.');
			return;
		}
		console.log('Connected to matchmaking service.');
		Router.navigateTo('/game/' + res.roomId);
	}
}
