import { API } from "../../api-static.js";
import { iconChevronRight, iconHomeStats, iconMinus, iconPlus } from "../icons/icons.js";

type Game = {
	id: string;
	game_mode_id: number;
	player1_name: number;
	player2_name: number;
	score1: number;
	score2: number;
	tech_win: boolean;
	duration: number;
	finished_at: string;
};

const PAGE_SIZE_OPTIONS = [5, 10, 15, 25, 50, 100] as const

export class UserGameHistory extends HTMLElement {
	private data: Game[] = []
	private currentPage = 1
	private pageSize: typeof PAGE_SIZE_OPTIONS[number] = 5
	private totalItems = 0
	private totalPages = 0
	private isLoading = false

	constructor() {
		super()
	}

	async connectedCallback() {
		await this.loadData()
		this.render()
		this.setupEventListeners()
	}

	disconnectedCallback() {
		this.cleanupEventListers()
	}

	private async loadData() {
		if (this.isLoading) return

		this.isLoading = true
		this.renderLoading()

		try {
			const response = await API.getUserGameHistory(this.currentPage, this.pageSize)
			this.data = response.data
			this.totalItems = response.meta.total
			this.totalPages = response.meta.totalPages
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
		const header = this.renderTableHeader()
		const body = this.renderTableBody()
		const pagination = this.renderPagination()
		const pageSizeBlock = this.renderPageSize()
		const totalPagesBlock = this.renderTotalPages()

		this.innerHTML = `
			<div class="tw-card">
				<div class="p-6 flex-1">
					<div class="flex items-center mb-6">
						<div class="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center mr-4">
							${iconHomeStats}
						</div>
						<h3 class="text-xl font-bold">Your Stats</h3>
					</div>

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

	private renderTableBody() {
		if (this.data.length === 0) {
			return `
				<tr>
					<td colspan="5" class="p-4 text-center text-gray-500">
						No game history found
					</td>
				</tr>
			`
		}

		return this.data.map(row => {

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

	private renderPagination() {
		const totalPages = Math.ceil(this.totalItems / this.pageSize)
		const isFirstPage = this.currentPage === 1
		const isLastPage = this.currentPage >= totalPages

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
						${this.currentPage}
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

	private renderPageSize() {
		const canIncrease = this.pageSize < PAGE_SIZE_OPTIONS[PAGE_SIZE_OPTIONS.length - 1] && this.pageSize < this.totalItems
		const canDecrease = this.pageSize > PAGE_SIZE_OPTIONS[0]

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
					${this.pageSize}
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

	private renderTotalPages() {
		return `
			<span class="relative ml-6 size-6 flex items-center bg-blue-500/10 text-xs text-blue-500 justify-center rounded-full select-none">
				${this.totalPages}
				<div
					class="absolute
						bottom-0 translate-y-full sm:bottom-auto
						sm:-right-1 sm:translate-x-full sm:-translate-y-1/2 sm:top-1/2 text-nowrap transition-all text-blue-900 dark:text-blue-100"
				>pages</div>
			</span>
		`
	}

	private formatDate(dateString: string): string {
		const options: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}
		return new Date(dateString).toLocaleDateString(undefined, options)
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

			if (action === 'prev' && this.currentPage > 1) {
				this.currentPage--
				this.loadData()
			} else if (action === 'next') {
				this.currentPage++
				this.loadData()
			} else if (target.id === 'retry-btn') {
				this.loadData()
			}
		})
	}

	private cleanupEventListers() {
		this.removeEventListener('click', () => {})
	}
}
