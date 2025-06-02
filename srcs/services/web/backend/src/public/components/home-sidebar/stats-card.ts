import { API } from "../../api-static.js"
import { UserStats } from "../../../types/user.js"
import { iconHomeStats } from "../icons/icons.js"

export class StatsCard extends HTMLElement {
	private btn: HTMLButtonElement | null = null
	private data: UserStats = {m_wins: 0, m_losses: 0, t_wins: 0, t_losses: 0, s_wins: 0, s_losses: 0}

	constructor() {
		super()
	}

	async connectedCallback() {
		this.data = await API.getUserPerformance()
		this.render()

		this.btn = this.querySelector('button')
		this.btn?.addEventListener('click', this)
	}

	disconnectedCallback() {
		this.btn?.removeEventListener('click', this)
	}

	handleEvent(event: Event) {
		event.preventDefault()
		console.log('Stats Card: button clicked')
	}

	private render() {
		this.innerHTML = `
			<div class="tw-card">
				<div class="p-6 flex-1">
					<div class="flex items-center mb-6">
						<div class="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center mr-4">
							${iconHomeStats}
						</div>
						<h3 class="text-xl font-bold text-white">Your Stats</h3>
					</div>

					<div class="grid grid-cols-3 gap-4 mb-6">
						<div class="dark:bg-gray-700/50 bg-gray-100 rounded-lg p-3 text-center dark:hover:bg-gray-700/60 hover:bg-gray-100/60 transition-colors">
							<div class="text-xl sm:text-2xl font-bold mb-1">${this.data.m_wins}</div>
							<div class="text-xs dark:text-gray-400 text-gray-500">Wins</div>
						</div>
						<div class="dark:bg-gray-700/50 bg-gray-100 rounded-lg p-3 text-center dark:hover:bg-gray-700/60 hover:bg-gray-100/60 transition-colors">
							<div class="text-xl sm:text-2xl font-bold mb-1">${this.data.m_wins + this.data.m_losses}</div>
							<div class="text-xs dark:text-gray-400 text-gray-500">Matches</div>
						</div>
						<div class="dark:bg-gray-700/50 bg-gray-100 rounded-lg p-3 text-center dark:hover:bg-gray-700/60 hover:bg-gray-100/60 transition-colors">
							<div class="text-xl sm:text-2xl font-bold text-green-400 mb-1">
								${
									(this.data.m_wins + this.data.m_losses)
										? (this.data.m_wins / (this.data.m_wins + this.data.m_losses) * 100).toFixed(1)
										: 0
								}%
							</div>
							<div class="text-xs dark:text-gray-400 text-gray-500">Win Rate</div>
						</div>
					</div>
				</div>

				<div class="p-6 pt-0">
					<button class="w-full px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-medium rounded-lg flex items-center justify-center transition-all duration-500 ease-out hover:scale-[1.04] hover:shadow-lg">
						View Profile →
					</button>
				</div>
			</div>
		`
	}
}
