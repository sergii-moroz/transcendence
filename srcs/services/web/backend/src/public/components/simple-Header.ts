import { iconSmallArrowLeft } from "./icons/icons.js"

export class simpleHeader extends HTMLElement {

	constructor() {
		super()
		this.render();
	}

	async connectedCallback() {
	}

	disconnectedCallback() {
	}

	private render() {
		const title = this.getAttribute('title') || '';
		const backTo = this.getAttribute('backTo') || '';
		
		this.innerHTML = `
			<div class="sticky top-0 z-20 bg-white/90 dark:bg-gray-800/90 border-b border-gray-200 dark:border-gray-700 shadow-sm">
				<div class="px-6 py-4 flex items-center">
					<a href='/${backTo}' data-link class="flex items-center gap-2 group cursor-pointer mr-6 hover:underline hover:underline-offset-4">
						<div class="size-8 flex items-center justify-center rounded-full border border-gray-400 transition-colors group-hover:border-black group-hover:dark:border-white bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
							${iconSmallArrowLeft}
						</div>
						<span class="text-gray-700 dark:text-gray-200">Back to ${backTo[0].toUpperCase() + backTo.slice(1)}</span>
					</a>

					<div class="flex-1 flex items-center">
						<div class="h-8 w-0.5 bg-gray-300 dark:bg-gray-600 mr-4 rounded-full"></div>
						<h1 class="text-2xl text-gray-900 dark:text-white tracking-tight font-bold">${title}</h1>
					</div>
				</div>
			</div>
		`
	}
}