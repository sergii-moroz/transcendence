export class IconButton extends HTMLElement {

	constructor() {
		super()
	}

	connectedCallback() {
		const icon = this.getAttribute('data-icon')

		this.innerHTML = '<span>Text</span>'

	}
}
