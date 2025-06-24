import { API } from "../../api-static.js"

import {
	iconHomeRocket,
	iconHomeTrophy
} from "../icons/icons.js"

import {
	GameMode,
	PlayerStats,
	TopPlayers
} from "../../../types/user.js"
import { Router } from "../../router-static.js"

export class TopPlayerCard extends HTMLElement {
	private btn: HTMLButtonElement | null = null
	private data: TopPlayers = { singleplayer: null, multiplayer: null, tournament: null}
	private modes: GameMode[] = ['singleplayer', 'multiplayer', 'tournament']

	constructor() {
		super()
	}

	async connectedCallback() {
		this.data = await API.getTopPlayers()
		// console.log("DATA", this.data)
		this.render()

		this.btn = this.querySelector('button')
		this.btn?.addEventListener('click', this)
	}

	disconnectedCallback() {
		this.btn?.removeEventListener('click', this)
	}

	handleEvent(event: Event) {
		event.preventDefault()
		// console.log("Top Player: view leaderboard button clicked")
		Router.navigateTo('/leaderboard')
	}

	private render() {
		const tabs = this.renderTabButtons()
		const sections = this.renderTabSections()

		this.innerHTML = `
			<div class="tw-card">
				<div class="p-6 flex-1">
					<div class="flex items-center mb-6">
						<div class="size-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mr-4">
							${ iconHomeRocket }
						</div>
						<h3 class="text-xl font-bold">Top Player</h3>
					</div>

					<!-- Tabs -->
					${tabs}

					<!-- { topPlayers } -->
					${ sections }

				</div>

				<div class="p-6 pt-0">
					<button class="w-full px-4 py-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 font-medium rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
						View Leaderboard →
					</button>
				</div>
			</div>
		`
	}

	private renderPlayerItem(item: PlayerStats, index: number): string {
		const colors = ["text-yellow-400", "text-gray-400", "text-yellow-600"]
		const colorClass = colors[index] || "text-yellow-400"
		const total = item.wins + item.losses
		// const winRate = total > 0 ? (item.wins / total * 100).toFixed(1) : "0.0"

		return `
			<div class="flex items-center p-3 dark:bg-gray-700/50 bg-gray-100 rounded-lg transition-colors dark:hover:bg-gray-700/70 hover:bg-gray-100/60">
				<div class="pr-3 ${colorClass}">
					${iconHomeTrophy}
				</div>
				<div class="flex-1">
					<div class="font-medium">${item.username}</div>
					<div class="text-xs dark:text-gray-400 text-gray-500">
						${item.wins} wins • ${total} matches
					</div>
				</div>
				<div class="flex flex-col items-end">
					<div class="text-lg font-bold text-yellow-400">
						${item.win_rate.toFixed(1)}%
					</div>
					<div class="text-xs dark:text-gray-400 text-gray-500">win rate</div>
				</div>
			</div>
		`
	}

	private renderTabButtons() {
		const icons = ['icon-home-single-player', 'icon-home-multiplayer', 'icon-home-tournament']

		return this.modes.map((mode, index) => {
			const iconElm = icons[index] || 'i'

			return `
				<input type="radio"
					id="tab-top-${mode}"
					name="top-tabs"
					class="hidden peer/${mode}" ${index === 0 ? "checked" : ""}
				>
				<label for="tab-top-${mode}"
					class="inline-block w-fit p-2 mb-2 sm:mb-3 rounded-full cursor-pointer hover:bg-gray-500/20
						peer-checked/${mode}:bg-yellow-500/10
						peer-checked/${mode}:hover:bg-yellow-500/20
						peer-checked/${mode}:text-yellow-500
						peer-checked/${mode}:px-3
						peer-checked/${mode}:[&>div>span]:inline-block"
				>
					<div class="flex items-center gap-2">
						<${iconElm} class="[&>svg]:size-4 sm:[&>svg]:size-5"></${iconElm}>
						<span class="hidden text-xs sm:text-sm">${mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
					</div>
				</label>
			`
		}).join('')
	}

	private renderTabSections() {
		return this.modes.map(mode => {
			const items = (this.data[mode] || []).slice(0, 3)

			const players = items.length
				? items.map((item, index) => this.renderPlayerItem(item, index)).join('')
				: `<div class="dark:bg-gray-700/50 bg-gray-100 rounded-lg p-3 text-center dark:hover:bg-gray-700/60 hover:bg-gray-100/60 transition-colors">
						<span>Take actions</span>
						<span class="block text-xs text-gray-500">be the first</span>
					</div>`

			return `
				<div class="leaderboard-section space-y-4 hidden peer-checked/${mode}:block" data-section="${mode}">
					${players}
				</div>
			`
		}).join('')
	}

}

// DO NOT DELETE
// NEEDED FOR TAILWINDCSS

// peer-checked/singleplayer:block
// peer-checked/singleplayer:text-yellow-500
// peer-checked/singleplayer:bg-yellow-500/10
// peer-checked/singleplayer:hover:bg-yellow-500/20
// peer-checked/singleplayer:px-3

// peer-checked/multiplayer:block
// peer-checked/multiplayer:text-yellow-500
// peer-checked/multiplayer:bg-yellow-500/10
// peer-checked/multiplayer:hover:bg-yellow-500/20
// peer-checked/multiplayer:px-3

// peer-checked/tournament:block
// peer-checked/tournament:text-yellow-500
// peer-checked/tournament:bg-yellow-500/10
// peer-checked/tournament:hover:bg-yellow-500/20
// peer-checked/tournament:px-3
