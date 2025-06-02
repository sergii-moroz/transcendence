import { MultiPlayerStats, TopPlayers } from "../../../types/user.js"
import { API } from "../../api-static.js"
import { iconHomeRocket, iconHomeTrophy } from "../icons/icons.js"

export class TopPlayerCard extends HTMLElement {
	private btn: HTMLButtonElement | null = null
	private data: TopPlayers = { singleplayer: null, multiplayer: null, tournament: null}
	// what if all players in db is n't played yet?? what would be returned??

	constructor() {
		super()
		// this.render()
	}

	async connectedCallback() {
		this.data = await API.getTopPlayers()
		console.log("DATA", this.data)
		this.render()

		this.btn = this.querySelector('button')
		this.btn?.addEventListener('click', this)
	}

	disconnectedCallback() {
		this.btn?.removeEventListener('click', this)
	}

	handleEvent(event: Event) {
		event.preventDefault()
		console.log("Top Player: view leaderboard button clicked")
	}

	private render() {
		const topPlayers = (this.data.multiplayer || [])
			.slice(0, 3)
			.map((item, i) => this.renderPlayerItem(item, i))
			.join('')

		this.innerHTML = `
			<div class="tw-card">
				<div class="p-6 flex-1">
					<div class="flex items-center mb-6">
					<div class="size-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mr-4">
						${ iconHomeRocket }
					</div>
					<h3 class="text-xl font-bold">Top Player</h3>
					</div>

					<div class="space-y-4 mb-6">
						${ topPlayers }

					</div>
				</div>

				<div class="p-6 pt-0">
					<button class="w-full px-4 py-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 font-medium rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
						View Leaderboard →
					</button>
				</div>
			</div>
		`
	}

	private renderPlayerItem(item: MultiPlayerStats, index: number): string {
		const colors = ["text-yellow-400", "text-gray-400", "text-yellow-600"]
		const colorClass = colors[index] || "text-yellow-400"
		const total = item.m_wins + item.m_losses
		const winRate = total > 0 ? (item.m_wins / total * 100).toFixed(1) : "0.0"

		return `
			<div class="flex items-center p-3 dark:bg-gray-700/50 bg-gray-100 rounded-lg transition-colors dark:hover:bg-gray-700/70 hover:bg-gray-100/60">
				<div class="pr-3 ${colorClass}">
					${iconHomeTrophy}
				</div>
				<div class="flex-1">
					<div class="font-medium">${item.username}</div>
					<div class="text-xs dark:text-gray-400 text-gray-500">
						${item.m_wins} wins • ${total} matches
					</div>
				</div>
				<div class="flex flex-col items-end">
					<div class="text-lg font-bold text-yellow-400">
						${winRate}%
					</div>
					<div class="text-xs dark:text-gray-400 text-gray-500">win rate</div>
				</div>
			</div>
		`
	}
}
