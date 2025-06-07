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
						{header}
						<tbody>
						 {body}
						</tbody>
					</table>

				</div>

			</div>
		`
	}

	private setupEventListeners() {

	}

	private cleanupEventListers() {

	}

}
