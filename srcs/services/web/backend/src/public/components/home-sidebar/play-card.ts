import { Router } from "../../router-static.js"
import { iconHomeSingleplayer } from "../icons/icons.js"

export class PlayCard extends HTMLElement {
	private btn: HTMLButtonElement | null = null

	constructor() {
		super()
		this.render()
	}

	connectedCallback() {
		this.btn = this.querySelector('button')

		this.btn?.addEventListener('click', this)
	}

	disconnectedCallback() {
		//
	}

	handleEvent(event: Event) {
		event.preventDefault()
		const href = this.getAttribute('href') || '#'
		Router.navigateTo(href)
	}

	private render() {
		const title = this.getAttribute('title') || 'Card Title'
		const description = this.getAttribute('description') || 'Card description'
		const buttonText = this.getAttribute('button-text') || 'Click me'
		const icon = this.getAttribute('icon') || 'icon'
		const accentColor = this.getAttribute('accent-color') || 'red'

		this.innerHTML = `
			<div class="bg-white rounded-2xl overflow-hidden border border-gray-200 transition-all duration-700 ease-out hover:scale-[1.005] hover:shadow-lg
				dark:bg-gray-800 dark:border-gray-700 dark:shadow-purple-600/25 h-full p-6 flex flex-col justify-between"
			>
				<div>
					<div class="w-16 h-16 rounded-lg bg-${accentColor}-500/10 flex items-center justify-center mb-6">
						<${icon} class="text-${accentColor}-400 [&>svg]:size-8"></${icon}>
					</div>
					<h3 class="text-xl font-bold mb-3">${title}</h3>
					<p class="dark:text-gray-400 text-gray-500 mb-6 text-sm">${description}</p>
				</div>
				<button class="px-6 py-3 bg-${accentColor}-500 rounded-lg text-white font-medium hover:shadow-lg transition-all duration-500 ease-out hover:scale-[1.04]">
					${buttonText}
				</button>

			</div>
		`
	}
}

//	Do not delete
//	text-blue-400		bg-blue-500		bg-blue-500/10
//	text-green-400	bg-green-500	bg-green-500/10
//	text-purple-400	bg-purple-500	bg-purple-500/10
//	text-red-400		bg-red-500		bg-red-500/10
//	text-cyan-400		bg-cyan-500		bg-cyan-500/10
