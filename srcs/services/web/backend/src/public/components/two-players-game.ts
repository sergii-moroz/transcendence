import {
	AbstractMesh,
	Camera,
	Color3,
	Engine,
	HDRCubeTexture,
	ImportMeshAsync,
	ISceneLoaderAsyncResult,
	Matrix,
	MeshBuilder,
	PBRMaterial,
	Scene,
	Space,
	StandardMaterial,
	Texture,
	TrailMesh,
	UniversalCamera,
	Vector3,
} from "@babylonjs/core"

import { gameJson, GameState } from "../types.js"
import { Router } from "../router-static.js"
import { HitEffect } from "../utils/hit-effect.js"
import { clamp, loadRandomCharacter } from "../utils/utils.js"
import { ScoreBoard } from "../utils/score.js"
import { API } from "../api-static.js"
import { InfoBoard } from "../utils/info-board.js"

const STEP = 4
const WIDTH = 250
const HEIGHT = 150
const MIN_Y = -HEIGHT + 30
const MAX_Y = HEIGHT - 30

export class TwoPlayersGame extends HTMLElement {
	private ballTrail: TrailMesh | null = null
	private keysPressed: { [key: string]: boolean } = {}

	// Babylon.js components
	private canvas: HTMLCanvasElement | null = null
	private engine: Engine | null = null
	private scene: Scene | null = null
	private resizeObserver: ResizeObserver | null = null
	private cameras: Camera[] = []

	// Game objects
	private ball: AbstractMesh | null = null
	private character1: AbstractMesh | null = null
	private character2: AbstractMesh | null = null
	private paddle1: AbstractMesh | undefined = undefined
	private paddle2: AbstractMesh | null = null
	private fieldWidth = 250
	private fieldHeight = 150

	private hitEffect: HitEffect | null = null
	private scoreBoard: ScoreBoard | null = null
	private infoBoard: InfoBoard | null = null

	private preGameScreen: HTMLElement | null = null

	private gameRoomId: string | null = null
	private socket: WebSocket | null = null
	private state: GameState | null = null
	private gameOver: boolean = false
	private gameOverMessage: { message: string, winner: string } | null = null
	private homeBtn: HTMLElement | null = null

	constructor() {
		super()
		this.state = {
			ball: { x: 0, y: 0, dx: 4, dy: 4 },
			paddles: {
				player1: { y: 0 },
				player2: { y: 0 }
			},
			scores: { player1: 0, player2: 0, user1: 'Player 1', user2: 'Player 2' },
			hit: false
		}
	}


}
