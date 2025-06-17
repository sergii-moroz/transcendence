import {
	Game,
	GAME_MODE_MAP,
	GAME_MODES,
	GameHistoryState,
	GameModeData,
	GameModeName,
	PAGE_SIZE_OPTIONS
} from "../../types/game-history.types.js";

import {
	iconChevronRight,
	iconHomeStats,
	iconMinus,
	iconPlus
} from "../icons/icons.js";

import { API } from "../../api-static.js";

export class UserGameHistory extends HTMLElement {
	private modes: GameModeName[] = ['Singleplayer', 'Multiplayer', 'Tournament']
	private isLoading = false
	private state: GameHistoryState = {
		Singleplayer: {
			data: [],
			currentPage: 1,
			pageSize: 5,
			totalItems: 0,
			totalPages: 0
		},
		Multiplayer: {
			data: [],
			currentPage: 1,
			pageSize: 5,
			totalItems: 0,
			totalPages: 0
		},
		Tournament: {
			data: [],
			currentPage: 1,
			pageSize: 5,
			totalItems: 0,
			totalPages: 0
		},
		currentMode: "Singleplayer"
	}

	constructor() {
		super()
	}

	async connectedCallback() {
		await this.loadAllData()
		this.render()
		this.setupEventListeners()
	}

	disconnectedCallback() {
		this.cleanupEventListers()
	}

	private async loadAllData() {
		if (this.isLoading) return

		this.isLoading = true
		this.renderLoading()

		try {
			// load data for all game modes in parallel
			const [single, multi, tournament] = await Promise.all([
				await API.getUserGameHistory(this.state.Singleplayer.currentPage, this.state.Singleplayer.pageSize, GAME_MODES.Singleplayer),
				await API.getUserGameHistory(this.state.Multiplayer.currentPage, this.state.Multiplayer.pageSize, GAME_MODES.Multiplayer),
				await API.getUserGameHistory(this.state.Tournament.currentPage, this.state.Tournament.pageSize, GAME_MODES.Tournament),
			])

			this.state.Singleplayer = {
				data: single.data,
				totalItems: single.meta.total,
				currentPage: single.meta.page,
				pageSize: single.meta.pageSize,
				totalPages: single.meta.totalPages,
			}

			this.state.Multiplayer = {
				data: multi.data,
				totalItems: multi.meta.total,
				currentPage: multi.meta.page,
				pageSize: multi.meta.pageSize,
				totalPages: multi.meta.totalPages,
			}

			this.state.Tournament = {
				data: tournament.data,
				totalItems: tournament.meta.total,
				currentPage: tournament.meta.page,
				pageSize: tournament.meta.pageSize,
				totalPages: tournament.meta.totalPages,
			}

		} catch (error) {
			console.log('Error loading game history:', error)
			this.renderError()
		} finally {
			this.isLoading = false
			this.render()
		}
	}

	private async loadDataForMode(mode: GameModeName) {
		if (this.isLoading) return

		this.isLoading = true
		this.renderLoading()

		try {
			const currentState = this.state[mode]
			const response = await API.getUserGameHistory(
				currentState.currentPage,
				currentState.pageSize,
				GAME_MODE_MAP[mode]
			)

			this.state[mode] = {
				data: response.data,
				currentPage: response.meta.page,
				pageSize: response.meta.pageSize,
				totalItems: response.meta.total,
				totalPages: response.meta.totalPages,
			}

			this.state.currentMode = mode
		} catch (error) {
			console.log('Error loading game history:', error)
			this.renderError()
		} finally {
			this.isLoading = false
			this.render()
		}
	}

	private renderLoading() {
		this.innerHTML = `
			<div class="tw-card p-6">
				<div class="animate-pulse space-y-4">
					<div class="h-6 bg-gray-200 rounded w-1/4"></div>
					<div class="h-4 bg-gray-200 rounded"></div>
					<div class="h-4 bg-gray-200 rounded"></div>
					<div class="h-4 bg-gray-200 rounded w-3/4"></div>
				</div>
			</div>
		`
	}

	private renderError() {
		this.innerHTML = `
			<div class="tw-card p-6 text-red-500">
				Failed to load game history.
				<button id="retry-btn" class="text-blue-500">Retry</button>
			</div>
		`
	}

	private render() {
		const currentMode = this.state.currentMode
		const currentData = this.state[currentMode]

		const header = this.renderTableHeader()
		const body = this.renderTableBody(currentData.data)
		const pagination = this.renderPagination(currentData)
		const pageSizeBlock = this.renderPageSize(currentData.pageSize, currentData.totalItems)
		const totalPagesBlock = this.renderTotalPages(currentData.totalPages)
		const tabs = this.renderTabButtons()

		this.innerHTML = `
			<div class="tw-card">
				<div class="p-6 flex-1">
					<div class="flex items-center mb-6">
						<div class="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center mr-4">
							${iconHomeStats}
						</div>
						<h3 class="text-xl font-bold">Your Stats</h3>
					</div>

					<!-- Tabs -->
					${tabs}

					<table class="table-auto w-full border-separate border-spacing-y-1 text-xs sm:text-base">
						${header}
						<tbody>
						 ${body}
						</tbody>
					</table>

					<div class="flex items-center justify-between mt-6">
						${totalPagesBlock}
						${pagination}
						${pageSizeBlock}
					</div>
				</div>

			</div>
		`
	}

	private renderTableHeader() {
		return `
			<thead>
				<tr class="bg-blue-500/30">
					<th class="px-1 py-2 sm:px-4 sm:py-2 rounded-l-lg">
						<span class="sm:hidden">P1</span>
						<span class="hidden sm:inline-block">Player 1</span>
					</th>
					<th class="px-1 py-2 sm:px-4 sm:py-2">Scores</th>
					<th class="px-1 py-2 sm:px-4 sm:py-2">
						<span class="sm:hidden">P2</span>
						<span class="hidden sm:inline-block">Player 2</span>
					</th>
					<th class="px-1 py-2 sm:px-4 sm:py-2">Duration</th>
					<th class="px-1 py-2 sm:px-4 sm:py-2 rounded-r-lg">Date</th>
				</tr>
			</thead>
		`
	}

	private renderTableBody(data: Game[]) {
		if (data.length === 0) {
			return `
				<tr>
					<td colspan="5" class="p-4 text-center text-gray-500">
						No game history found
					</td>
				</tr>
			`
		}

		return data.map(row => {

			return `
			<tr class="odd:bg-blue-500/10 text-blue-900 dark:text-blue-100 hover:bg-blue-500/20 [&>td]:px-1 [&>td]:py-2 sm:[&>td]:px-4 sm:[&>td]:py-2 text-center">
				<td class='rounded-l-lg ${row.score1 > row.score2 && "font-bold"}'>${row.player1_name}</td>
				<td>${row.score1} - ${row.score2}</td>
				<td ${row.score1 < row.score2 && 'class="font-bold"'}>${row.player2_name}</td>
				<td>${this.formatDuration(row.duration)}</td>
				<td class="rounded-r-lg">${this.formatDate(row.finished_at)}</td>
			</tr>
		`}).join('')
	}

	private renderPagination(state: GameModeData) {
		const isFirstPage = state.currentPage === 1
		const isLastPage = state.currentPage >= state.totalPages

		return `
			<div class="flex items-center justify-center gap-2">
				<button
					class="${ isFirstPage ? 'opacity-50 cursor-not-allowed' : '' }"
					${ isFirstPage ? 'disabled' : '' }
					data-action="prev"
				>
					<div class="size-8 flex items-center hover:bg-gray-500/20 justify-center rounded-full">
						<icon-chevron-left></icon-chevron-left>
					</div>
				</button>

				<div class="size-8 flex items-center bg-blue-500/10 text-blue-500 justify-center rounded-full select-none">
						${state.currentPage}
				</div>

				<button id="btn-next"
					class="${ isLastPage? 'opacity-50 cursor-not-allowed' : '' }"
					${ isLastPage ? 'disabled' : '' }
					data-action="next"
				>
					<div class="size-8 flex items-center hover:bg-gray-500/20 justify-center rounded-full">
						${iconChevronRight}
					</div>
				</button>
			</div>
		`
	}

	private renderPageSize(pageSize: number, totalItems: number) {
		const canIncrease = pageSize < PAGE_SIZE_OPTIONS[PAGE_SIZE_OPTIONS.length - 1] && pageSize < totalItems
		const canDecrease = pageSize > PAGE_SIZE_OPTIONS[0]

		return `
			<span class="flex items-center gap-1 text-xs hover:[&>button]:visible group">
				<button
					class="sm:invisible ${!canDecrease ? 'opacity-50 cursor-not-allowed' : ''}"
					${!canDecrease ? 'disabled': 0}
					data-action="page-size-minus"
				>
					<span class="size-6 flex items-center justify-center hover:bg-gray-500/20 rounded-full select-none [&>svg]:size-4 transition-all">
						${iconMinus}
					</span>
				</button>
				<span class="relative size-6 flex items-center bg-blue-500/10 text-blue-500 justify-center rounded-full select-none">
					${pageSize}
					<div
						class="absolute
							bottom-0 translate-y-full sm:bottom-auto
							sm:-left-1 sm:-translate-x-full sm:-translate-y-1/2 sm:top-1/2 text-nowrap sm:group-hover:-translate-x-[150%] transition-all text-blue-900 dark:text-blue-100"
					>page size</div>
				</span>
				<button
					class="sm:invisible ${!canIncrease ? 'opacity-50 cursor-not-allowed' : ''}"
					${!canIncrease ? 'disabled': ''}
					data-action="page-size-plus"
				>
					<span class="size-6 flex items-center justify-center hover:bg-gray-500/20 rounded-full select-none [&>svg]:size-4 transition-all">
						${iconPlus}
					</span>
				</button>
			</span>
		`
	}

	private renderTotalPages(totalPages: number) {
		return `
			<span class="relative ml-6 size-6 flex items-center bg-blue-500/10 text-xs text-blue-500 justify-center rounded-full select-none">
				${totalPages}
				<div
					class="absolute
						bottom-0 translate-y-full sm:bottom-auto
						sm:-right-1 sm:translate-x-full sm:-translate-y-1/2 sm:top-1/2 text-nowrap transition-all text-blue-900 dark:text-blue-100"
				>pages</div>
			</span>
		`
	}

	private formatDate(dateString: string): string {
		// 1. Parse the input date (assumed to be UTC)
		const date = new Date(dateString);

		// 2. Get the user's timezone offset (in minutes)
		const userTimezoneOffset = date.getTimezoneOffset() * 60000; // Convert to milliseconds

		// 3. Adjust the date to the user's local time
		const localDate = new Date(date.getTime() - userTimezoneOffset);

		// 4. Format the date (no need for `timeZone` in options)
		const options: Intl.DateTimeFormatOptions = {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
		};

		return localDate.toLocaleDateString(undefined, options);
	}

	private formatDuration(seconds: number): string {
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return mins ? `${mins}m ${secs}s` : `${secs}s`
	}

	private setupEventListeners() {
		this.addEventListener('click', (event) => {
			const target = event.target as HTMLElement
			const action = target.closest('[data-action]')?.getAttribute('data-action')

			if (action === 'prev') this.prevPage()
			if (action === 'next') this.nextPage()
			if (target.id === 'retry-btn') {
				// this.loadData()
			}
			if (action === 'page-size-plus') this.incPageSize()
			if (action === 'page-size-minus') this.decPageSize()

			this.modes.forEach(mode => {
				const radio = this.querySelector(`#tab-stats-${mode}`)
				radio?.addEventListener('change', () => {this.handleModeChange(mode)})
			})
		})
	}

	private handleModeChange(mode: GameModeName) {
		this.state.currentMode = mode
		this.loadDataForMode(mode)
	}

	private nextPage() {
		const currentMode = this.state.currentMode

		if (this.state[currentMode].currentPage < this.state[currentMode].totalPages)
		this.state[currentMode].currentPage++
		this.loadDataForMode(currentMode)
	}

	private prevPage() {
		const currentMode = this.state.currentMode

		if (this.state[currentMode].currentPage > 1) {
			this.state[currentMode].currentPage--
			this.loadDataForMode(currentMode)
		}
	}

	private cleanupEventListers() {
		this.removeEventListener('click', () => {})
	}

	private incPageSize() {
		const mode = this.state.currentMode
		const currentIndex = PAGE_SIZE_OPTIONS.indexOf(this.state[mode].pageSize)

		if (currentIndex < PAGE_SIZE_OPTIONS.length - 1) {
			const oldPageSize = this.state[mode].pageSize
			this.state[mode].pageSize = PAGE_SIZE_OPTIONS[currentIndex + 1]
			this.adjustPageForNewPageSize(oldPageSize)
		}
	}

	private decPageSize() {
		const mode = this.state.currentMode
		const currentIndex = PAGE_SIZE_OPTIONS.indexOf(this.state[mode].pageSize)

		if (currentIndex > 0) {
			const oldPageSize = this.state[mode].pageSize
			this.state[mode].pageSize = PAGE_SIZE_OPTIONS[currentIndex - 1]
			this.adjustPageForNewPageSize(oldPageSize)
		}
	}

	private adjustPageForNewPageSize(oldPageSize: number) {
		const mode = this.state.currentMode
		// Calculate which item we were viewing at the top of current page
		const firstVisibleItemIndex = oldPageSize * (this.state[mode].currentPage - 1);

		// Calculate what page this item would be on with the new page size
		const newPage = Math.max(1, Math.floor(firstVisibleItemIndex / this.state[mode].pageSize) + 1);

		this.state[mode].currentPage = newPage;

		this.loadDataForMode(mode);
	}

	private renderTabButtons() {
		const currentMode = this.state.currentMode
		return this.modes.map((mode, index) => {
			const iconElm = this.getModeIcon(mode)

			return `
				<input type="radio"
					id="tab-stats-${mode}"
					name="stats-tabs"
					class="hidden peer/${mode}" ${mode === currentMode ? "checked" : ""}
				>
				<label for="tab-stats-${mode}"
					class="inline-block w-fit px-2 xl:px-4 py-2 mb-2 sm:mb-3 rounded-full cursor-pointer hover:bg-gray-500/20
						peer-checked/${mode}:bg-blue-500/10
						peer-checked/${mode}:hover:bg-blue-500/20
						peer-checked/${mode}:text-blue-500
						peer-checked/${mode}:px-3
						peer-checked/${mode}:[&>div>span]:inline-block"
				>
					<div class="flex items-center gap-2">
						<${iconElm} class="[&>svg]:size-4 sm:[&>svg]:size-5"></${iconElm}>
						<span class="hidden text-xs sm:text-sm">${mode}</span>
					</div>
				</label>
			`
		}).join('')
	}

	private getModeIcon(mode: GameModeName): string {
		const icons = {
			Singleplayer: 'icon-home-single-player',
			Multiplayer: 'icon-home-multiplayer',
			Tournament: 'icon-home-tournament'
		}

		return icons[mode] || 'i'
	}
}

// DO NOT DELETE
// NEEDED FOR TAILWINDCSS

// peer-checked/Singleplayer:grid
// peer-checked/Singleplayer:text-blue-500
// peer-checked/Singleplayer:bg-blue-500/10
// peer-checked/Singleplayer:hover:bg-blue-500/20
// peer-checked/Singleplayer:px-3

// peer-checked/Multiplayer:grid
// peer-checked/Multiplayer:text-blue-500
// peer-checked/Multiplayer:bg-blue-500/10
// peer-checked/Multiplayer:hover:bg-blue-500/20
// peer-checked/Multiplayer:px-3

// peer-checked/Tournament:grid
// peer-checked/Tournament:text-blue-500
// peer-checked/Tournament:bg-blue-500/10
// peer-checked/Tournament:hover:bg-blue-500/20
// peer-checked/Tournament:px-3

// peer-checked/Singleplayer:[&>div>span]:inline-block
// peer-checked/Multiplayer:[&>div>span]:inline-block
// peer-checked/Tournament:[&>div>span]:inline-block
