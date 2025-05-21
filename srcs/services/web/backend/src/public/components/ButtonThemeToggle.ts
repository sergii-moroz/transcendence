import { iconMoon, iconSun } from "./icons.js"

const compoHTML = `
	<button
		id="theme-toggle"
		class="fixed bottom-5 left-5 z-50 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
		aria-label="Toggle Dark Mode"
	>
		<div class="w-6 h-6 text-gray-700 dark:hidden">${iconMoon}</div>
		<div class="w-6 h-6 text-yellow-300 hidden dark:block">${iconSun}</div>
	</button>
`

export class ButtonThemeToggle extends HTMLElement {
	constructor() {
		super()
		this.innerHTML = compoHTML
	}

	connectedCallback() {
		const storedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
		const html = document.documentElement

		if (storedTheme === 'dark') {
			html.classList.add('dark');
		} else {
			html.classList.remove('dark');
		}
		localStorage.theme = html.classList.contains('dark') ? 'dark' : 'light'

		this.addEventListener('click', this)
	}

	handleEvent(event: Event) {
		const html = document.documentElement
		html.classList.toggle('dark')
		localStorage.theme = html.classList.contains('dark') ? 'dark' : 'light'
	}

	disconnectedCallback() {
		this.removeEventListener('click', this)
	}

}
