
export type Game = {
	id: string
	game_mode_id: number
	player1_name: number
	player2_name: number
	score1: number
	score2: number
	tech_win: boolean
	duration: number
	finished_at: string
}

export type GameModeData = {
	data: Game[]
	currentPage: number
	pageSize: typeof PAGE_SIZE_OPTIONS[number]
	totalItems: number
	totalPages: number
}

export type GameModeName = "Singleplayer" | "Multiplayer" | "Tournament"

export type GameHistoryState = {
	Singleplayer: GameModeData
	Multiplayer: GameModeData
	Tournament: GameModeData
	currentMode: GameModeName
}

export const enum GAME_MODES {
	Singleplayer = 1,
	Multiplayer = 2,
	Tournament = 3
}

export const GAME_MODE_MAP: Record<GameModeName, GAME_MODES> = {
	Singleplayer: GAME_MODES.Singleplayer,
	Multiplayer: GAME_MODES.Multiplayer,
	Tournament: GAME_MODES.Tournament
}

export const PAGE_SIZE_OPTIONS = [5, 10, 15, 25, 50, 100]
