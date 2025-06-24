import { API } from "../../api-static.js"
import { iconHomeStats } from "../icons/icons.js"

import {
	GameMode,
	UserStats
} from "../../../types/user.js"
import { Router } from "../../router-static.js"

export class StatsCard extends HTMLElement {
	private btn: HTMLButtonElement | null = null
	private data: UserStats = {m_wins: 0, m_losses: 0, t_wins: 0, t_losses: 0, s_wins: 0, s_losses: 0}
	private modes: GameMode[] = ['singleplayer', 'multiplayer', 'tournament']
	private data2 = {
		singleplayer: {wins: 0, losses: 0},
		multiplayer: {wins: 0, losses: 0},
		tournament: {wins: 0, losses: 0}
	}

	constructor() {
		super()
		this.render()
	}

	async connectedCallback() {
		const opts = this.getAttribute('data-owner')
		const response = opts === null
			? await API.getUserPerformance(window.location.pathname.split("/").pop()!)
			: await API.getUserPerformance(null)

		if (!response.success) return

		this.data = response.data
		this.data2 = {
			singleplayer: {wins: this.data.s_wins, losses: this.data.s_losses},
			multiplayer: {wins: this.data.m_wins, losses: this.data.m_losses},
			tournament: {wins: this.data.t_wins, losses: this.data.t_losses},
		}
		this.render()

		this.btn = this.querySelector('button')
		this.btn?.addEventListener('click', this)
	}

	disconnectedCallback() {
		this.btn?.removeEventListener('click', this)
	}

	handleEvent(event: Event) {
		event.preventDefault()
		Router.navigateTo(`/profile/${Router.username}`);
	}

	private render() {
		const tabs = this.renderTabButtons()
		const sections = this.renderSections()
		const mode = this.getAttribute('mode') || 'home'

		this.innerHTML = `
			<div class="tw-card h-full">
				<div class="p-6 flex-1">
					<div class="flex items-center mb-6">
						<div class="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center mr-4">
							${iconHomeStats}
						</div>
						<h3 class="text-xl font-bold">${mode === 'profile' ? 'Game Stats' : 'Your Stats'}</h3>
					</div>

					<three-ring-donut class="${mode === 'profile' ? '' : 'hidden'}"
						singleplayer="${this.calculateWinRate(this.data2.singleplayer)}"
						multiplayer="${this.calculateWinRate(this.data2.multiplayer)}"
						tournament="${this.calculateWinRate(this.data2.tournament)}"
					></three-ring-donut>

					<!-- Tabs -->
					<div>
						${tabs}
						${sections}
					</div>
				</div>

				<div class="p-6 pt-0 ${mode === 'profile' ? 'hidden' : ''}">
					<button class="w-full px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-medium rounded-lg flex items-center justify-center transition-all duration-500 ease-out hover:scale-[1.04] hover:shadow-lg">
						View Profile →
					</button>
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
					id="tab-stats-${mode}"
					name="stats-tabs"
					class="hidden peer/${mode}" ${index === 0 ? "checked" : ""}
				>
				<label for="tab-stats-${mode}"
					class="inline-block w-fit p-2 mb-2 sm:mb-3 rounded-full cursor-pointer hover:bg-gray-500/20
						peer-checked/${mode}:bg-blue-500/10
						peer-checked/${mode}:hover:bg-blue-500/20
						peer-checked/${mode}:text-blue-500
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

	private renderModeStats(item: {wins: number, losses: number}) {
		const total = item.wins + item.losses
		const winRate = total > 0 ? (item.wins / total * 100).toFixed(1) : "0.0"

		return `
			<div class="dark:bg-gray-700/50 bg-gray-100 rounded-lg p-3 text-center dark:hover:bg-gray-700/60 hover:bg-gray-100/60 transition-colors">
				<div class="text-xl sm:text-2xl font-bold mb-1">${item.wins}</div>
				<div class="text-xs dark:text-gray-400 text-gray-500">Wins</div>
			</div>
			<div class="dark:bg-gray-700/50 bg-gray-100 rounded-lg p-3 text-center dark:hover:bg-gray-700/60 hover:bg-gray-100/60 transition-colors">
				<div class="text-xl sm:text-2xl font-bold mb-1">${total}</div>
				<div class="text-xs dark:text-gray-400 text-gray-500">Matches</div>
			</div>
			<div class="dark:bg-gray-700/50 bg-gray-100 rounded-lg p-3 text-center dark:hover:bg-gray-700/60 hover:bg-gray-100/60 transition-colors">
				<div class="text-xl sm:text-2xl font-bold text-green-400 mb-1">
					${winRate}%
				</div>
				<div class="text-xs dark:text-gray-400 text-gray-500">Win Rate</div>
			</div>
		`
	}

	private renderSections() {
		return this.modes.map(mode => {
			const block = this.renderModeStats(this.data2[mode])

			return `
				<div class="grid grid-cols-3 gap-4 hidden peer-checked/${mode}:grid" data-section="${mode}">
					${block}
				</div>
			`
		}).join('')
	}

	private calculateWinRate(item: {wins: number, losses: number}): string {
		const total = item.wins + item.losses
		const winRate = total > 0 ? (item.wins / total * 100).toFixed(1) : "0.0"
		return winRate
	}
}

// DO NOT DELETE
// NEEDED FOR TAILWINDCSS

// peer-checked/singleplayer:grid
// peer-checked/singleplayer:text-blue-500
// peer-checked/singleplayer:bg-blue-500/10
// peer-checked/singleplayer:hover:bg-blue-500/20
// peer-checked/singleplayer:px-3

// peer-checked/multiplayer:grid
// peer-checked/multiplayer:text-blue-500
// peer-checked/multiplayer:bg-blue-500/10
// peer-checked/multiplayer:hover:bg-blue-500/20
// peer-checked/multiplayer:px-3

// peer-checked/tournament:grid
// peer-checked/tournament:text-blue-500
// peer-checked/tournament:bg-blue-500/10
// peer-checked/tournament:hover:bg-blue-500/20
// peer-checked/tournament:px-3

// peer-checked/singleplayer:[&>div>span]:inline-block
// peer-checked/multiplayer:[&>div>span]:inline-block
// peer-checked/tournament:[&>div>span]:inline-block
