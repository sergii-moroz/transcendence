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

import { GameState } from "../types.js"
import { Router } from "../router-static.js"
import { HitEffect } from "../utils/hit-effect.js"
import { clamp, loadRandomCharacter } from "../utils/utils.js"
import { ScoreBoard } from "../utils/score.js"
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

	private state: GameState | null = null
	private gameOver: boolean = false
	private gameOverMessage: { message: string, winner: string } | null = null
	private homeBtn: HTMLElement | null = null
	private gameRunning: boolean = false
	private matchId: string = ""

	constructor() {
		super()
		this.state = {
			ball: { x: 0, y: 0, dx: 4, dy: 4 },
			paddles: {
				player1: { y: 0 },
				player2: { y: 0 }
			},
			scores: {
				player1: 0,
				player2: 0,
				user1: this.getAttribute('player-1') || 'Player 1',
				user2: this.getAttribute('player-2') || 'Player 2'
			},
			hit: false
		}

		this.matchId = this.getAttribute('match-id') || "unknown"
	}

	connectedCallback() {
		this.render()
		this.initializeScene()
		this.homeBtn?.addEventListener('click', this.handleBackHome);
		window.addEventListener("popstate", this.handleBackHome);
		document.addEventListener('keydown', this.handleKeyDown);
		document.addEventListener('keyup', this.handleKeyUp);
		document.addEventListener('pointerdown', this.handlePointerDown)
		document.addEventListener('pointerup', this.handlePointerUp)
	}

	disconnectedCallback() {
		this.cleanup()
		window.removeEventListener("popstate", this.handleBackHome);
		document.removeEventListener('keydown', this.handleKeyDown);
		document.removeEventListener('keyup', this.handleKeyUp);
		document.removeEventListener('pointerdown', this.handlePointerDown)
		document.removeEventListener('pointerup', this.handlePointerUp)
	}

	private render() {
		this.innerHTML = `
			<div class="relative z-0 w-full">
				<canvas class="w-full h-full block"></canvas>
			</div>
		`
	}

	private async initializeScene() {
		this.canvas = this.querySelector('canvas')
		if (!this.canvas) return

		this.createPregameScreen();

		// Initialize Babylon.js engine
		this.engine = new Engine(this.canvas, true, {
			preserveDrawingBuffer: true,
			stencil: true
		})
		this.scene = new Scene(this.engine)

		// Static camera setup
		const alpha = 15
		const camera = new UniversalCamera("camera-1", new Vector3(0, -400 * Math.sin(alpha * Math.PI / 180), -400 * Math.cos(alpha * Math.PI / 180)), this.scene);
		camera.mode = Camera.PERSPECTIVE_CAMERA
		camera.rotation = new Vector3(0, 0, 0); // Lock rotation
		camera.lockedTarget = Vector3.Zero(); // Look at center
		this.cameras.push(camera)

		const camera2 = new UniversalCamera("camera-2", new Vector3(400, 0, -400), this.scene);
		camera2.mode = Camera.PERSPECTIVE_CAMERA
		camera2.rotation.z = Math.PI/2
		camera2.rotation.y = -40 / 90 * Math.PI/2
		this.cameras.push(camera2)

		const camera3 = new UniversalCamera("camera-3", new Vector3(-400, 0, -400), this.scene);
		camera3.mode = Camera.PERSPECTIVE_CAMERA
		camera3.rotation.z = -Math.PI/2
		camera3.rotation.y = 40 / 90 * Math.PI/2
		this.cameras.push(camera3)

		// Lighting
		const hdr = new HDRCubeTexture("../textures/citrus_orchard_road_puresky_1k.hdr", this.scene, 128, false, true, false, true);
		const rotationMatrix = Matrix.RotationX(Math.PI / 2);
		hdr.coordinatesMode = Texture.PROJECTION_MODE;
		hdr.getReflectionTextureMatrix().multiplyToRef(rotationMatrix, hdr.getReflectionTextureMatrix());

		this.scene.environmentTexture = hdr

		// create game objects
		this.createField()
		this.createBall()
		this.hitEffect = new HitEffect(this.scene)
		this.createCharacter()
		this.scoreBoard = new ScoreBoard(this.scene)
		this.scoreBoard.setPosition(0, 149.5, 0)
		this.infoBoard = new InfoBoard(this.scene)
		this.infoBoard.setPosition(0, -100, 28)
		this.infoBoard.updateInfo("▼ down", "up ▲")
		this.infoBoard.setVisibility(0)

		// Handle resize
		this.resizeObserver = new ResizeObserver(() => {
			this.engine?.resize()
			if (this.engine?.hostInformation.isMobile) {
				this.infoBoard?.setVisibility(1)
			} else {
				this.infoBoard?.setVisibility(0)
			}
		})

		this.resizeObserver.observe(this.canvas)

		// Run render loop
		this.engine.runRenderLoop(() => {
			this.scene?.render()
			this.updateGameState()
			this.updateGameObjects()
			this.sendInput();
		})
	}

	private createPregameScreen() {
		if (!this.canvas) return

		this.preGameScreen = document.createElement('div');
		this.preGameScreen.className = `flex flex-col z-10 absolute inset-0 bg-black/50 justify-center items-center text-white text-2xl`;

		const waitingText = document.createElement('div');
		waitingText.className = 'text-center font-bold';
		waitingText.id = 'waiting-text';
		waitingText.textContent = 'Press any key to start...';

		const countdownText = document.createElement('div');
		countdownText.className = `text-4xl font-bold mt-4 hidden`;
		countdownText.id = 'countdown-text';

		this.preGameScreen.appendChild(waitingText);
		this.preGameScreen.appendChild(countdownText);
		this.canvas.parentElement?.appendChild(this.preGameScreen);
	}

	private removePregameScreen() {
		if (this.preGameScreen) {
			this.preGameScreen.remove();
			this.preGameScreen = null;
		}
	}

	private async createField() {
		if (!this.scene) return
		// Create field boundaries
		const linePoints = [
			new Vector3(-this.fieldWidth, -this.fieldHeight, 0),
			new Vector3(-this.fieldWidth, this.fieldHeight, 0),
			new Vector3(this.fieldWidth, this.fieldHeight, 0),
			new Vector3(this.fieldWidth, -this.fieldHeight, 0),
			new Vector3(-this.fieldWidth, -this.fieldHeight, 0)
		]
		MeshBuilder.CreateLines("walls", { points: linePoints }, this.scene)

		// Create floor
		const ground = await this.loadField(this.scene)
		ground.position.z = 30
	}

	private createBall() {
		if (!this.scene) return

		this.ball = MeshBuilder.CreateSphere("ball", { diameter: 10 }, this.scene)
		const ballMat = new PBRMaterial("ballMat", this.scene)
		ballMat.albedoColor = new Color3(1, 1, 1)
		ballMat.metallic = 0.0
		ballMat.roughness = 0.5
		this.ball.material = ballMat

		// Create ball trail
		this.ballTrail = new TrailMesh("ballTrail", this.ball, this.scene, 0.5, 30, true)
		const trailMat = new StandardMaterial("trailMat", this.scene)
		trailMat.emissiveColor = new Color3(0.8, 0.8, 1)
		trailMat.alpha = 0.6
		this.ballTrail.material = trailMat
	}

	private async createCharacter() {
		if (!this.scene) return

		this.character1 = await loadRandomCharacter(this.scene)
		this.character1.rotate(new Vector3(0, 0, 1), Math.PI / 2, Space.WORLD);
		this.character1.position.x = -this.fieldWidth - 5
		this.character1.position.z = 30

		this.character2 = await loadRandomCharacter(this.scene)
		this.character2.rotate(new Vector3(0, 0, 1), -Math.PI / 2, Space.WORLD);
		this.character2.position.x = this.fieldWidth + 5
		this.character2.position.z = 30

		this.paddle1 = await this.loadPaddle(this.scene)
		this.paddle2 = await this.loadPaddle(this.scene)
		this.paddle1.scaling = new Vector3(20, 20, 20)
		this.paddle2.scaling = new Vector3(20, 20, 20)
		this.paddle1.position.x = -this.fieldWidth + 5
		this.paddle2.position.x = this.fieldWidth - 5
	}

	private updateGameState() {
		const FIELD_X = 250, FIELD_Y = 150
		const PADDLE_X1 = -FIELD_X + 10, PADDLE_X2 = FIELD_X - 10
		const PADDLE_HEIGHT = 30
		const BALL_RADIUS = 5
		const BALL_SPEED = 4

		if (!this.state || !this.gameRunning) return

		this.state.hit = false

		// Update ball position
		this.state.ball.x += this.state.ball.dx
		this.state.ball.y += this.state.ball.dy

		// Ball collision with paddles (simplified)
		if (
			this.state.ball.x <= PADDLE_X1 + BALL_RADIUS &&
			Math.abs(this.state.ball.y - this.state.paddles.player1.y) < PADDLE_HEIGHT
		) {
			this.state.ball.dx *= -1;
			this.state.ball.dx *= 1.05; // Increase speed after hitting paddle
			this.state.ball.dy *= 1.05; // Increase speed after hitting paddle
			this.state.hit = true
		} else if (
			this.state.ball.x >= PADDLE_X2 - BALL_RADIUS &&
			Math.abs(this.state.ball.y - this.state.paddles.player2.y) < PADDLE_HEIGHT
		) {
			this.state.ball.dx *= -1;
			this.state.ball.dx *= 1.05; // Increase speed after hitting paddle
			this.state.ball.dy *= 1.05; // Increase speed after hitting paddle
			this.state.hit = true
		}

		// Ball collision with walls
		if (this.state.ball.y <= -FIELD_Y + BALL_RADIUS || this.state.ball.y >= FIELD_Y - BALL_RADIUS) {
			this.state.ball.dy *= -1;
			this.state.hit = true
		}

		// Scoring
		if (this.state.ball.x <= -FIELD_X + BALL_RADIUS) {
			this.state.scores.player2++
			this.state.ball.dx = BALL_SPEED // Reset ball speed
			this.state.ball.dy = BALL_SPEED // Reset ball speed
			this.state.ball.x = PADDLE_X2 - 10;
			this.state.ball.y = this.state.paddles.player2.y
		}
		if (this.state.ball.x >= FIELD_X - BALL_RADIUS) {
			this.state.scores.player1++
			this.state.ball.dx = BALL_SPEED // Reset ball speed
			this.state.ball.dy = BALL_SPEED // Reset ball speed
			this.state.ball.x = PADDLE_X1 + 10;
			this.state.ball.y = this.state.paddles.player1.y
		}

		// Stop the game
		if (this.state.scores.player1 >= 7 || this.state.scores.player2 >= 7) {
			this.gameRunning = false

			const winnerId = this.state.scores.player1 < this.state.scores.player2 ? "1" : "0"
			const winnerName = winnerId ? this.state.scores.user2 : this.state.scores.user1

			this.dispatchEvent(new CustomEvent('game-finished', {
				bubbles: true,
				detail: { id: winnerId, name: winnerName, matchId: this.matchId }
			}))
		}
	}

	private updateGameObjects() {
		if (!this.state || !this.ball || !this.character1 || !this.character2) return
		if (!this.paddle1 || !this.paddle2) return

		// update ball position
		this.ball.position.x = this.state.ball.x
		this.ball.position.y = this.state.ball.y
		this.ball.position.z = 0

		// Update paddles
		this.character1.position.y = this.state.paddles.player1.y
		this.character2.position.y = this.state.paddles.player2.y

		const deltaY1 = this.ball.position.y - this.character1.position.y
		const clampedY1 = clamp(deltaY1, -25, 25)
		this.paddle1.position.y = this.character1.position.y + clampedY1
		this.paddle1.rotationQuaternion = null
		this.paddle1.rotation.x = (clampedY1 / 25) * (Math.PI / 2) + Math.PI

		const deltaY2 = this.ball.position.y - this.character2.position.y
		const clampedY2 = clamp(deltaY2, -25, 25)
		this.paddle2.position.y = this.character2.position.y + clampedY2
		this.paddle2.rotationQuaternion = null
		this.paddle2.rotation.x = (clampedY2 / 25) * (Math.PI / 2) + Math.PI

		this.scoreBoard?.updateScore(this.state.scores.player1, this.state.scores.player2, this.state.scores.user1, this.state.scores.user2)

		if (this.state.hit) {
			this.hitEffect?.playHitEffect({
				x: this.state.ball.x,
				y: this.state.ball.y
			})
		}

	}

	handleBackHome = () => Router.navigateTo('/home')

	handleKeyDown = (e: KeyboardEvent) => {
		if (!this.scene || this.gameOver) return;

		if (this.preGameScreen) {
			this.removePregameScreen()
			this.gameRunning = true
		}

		e.preventDefault();
		if (e.key === '1') {
			this.scene.activeCamera = this.cameras[0]
		} else if (e.key === '2') {
			this.scene.activeCamera = this.cameras[1]
		} else if (e.key === '3') {
			this.scene.activeCamera = this.cameras[2]
		} else {
			this.keysPressed[e.key] = true;
		}
	};

	handleKeyUp = (e: KeyboardEvent) => {
		if (this.gameOver) return;
		// if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
			e.preventDefault();
			this.keysPressed[e.key] = false;
		// }
	};

	sendInput = () => {
		if (!this.state || this.gameOver || !this.scene?.activeCamera) return

		const activeCameraName = this.scene.activeCamera.name
		switch (activeCameraName) {
			case "camera-1":
				if (this.keysPressed['ArrowUp'] && this.state.paddles.player2.y < MAX_Y) {
					this.state.paddles.player2.y += STEP
				}
				if (this.keysPressed['ArrowDown'] && this.state.paddles.player2.y > MIN_Y) {
					this.state.paddles.player2.y -= STEP
				}
				if ((this.keysPressed['W'] || this.keysPressed['w']) && this.state.paddles.player1.y < MAX_Y) {
					this.state.paddles.player1.y += STEP
				}
				if ((this.keysPressed['S'] || this.keysPressed['s']) && this.state.paddles.player1.y > MIN_Y) {
					this.state.paddles.player1.y -= STEP
				}
				break
			case "camera-2":
				if (this.keysPressed['ArrowRight'] && this.state.paddles.player2.y < MAX_Y) {
					this.state.paddles.player2.y += STEP
				}
				if (this.keysPressed['ArrowLeft'] && this.state.paddles.player2.y > MIN_Y) {
					this.state.paddles.player2.y -= STEP
				}
				if ((this.keysPressed['D'] || this.keysPressed['d']) && this.state.paddles.player1.y < MAX_Y) {
					this.state.paddles.player1.y += STEP
				}
				if ((this.keysPressed['A'] || this.keysPressed['a']) && this.state.paddles.player1.y > MIN_Y) {
					this.state.paddles.player1.y -= STEP
				}
				break
			case "camera-3":
				if (this.keysPressed['ArrowLeft'] && this.state.paddles.player2.y < MAX_Y) {
					this.state.paddles.player2.y += STEP
				}
				if (this.keysPressed['ArrowRight'] && this.state.paddles.player2.y > MIN_Y) {
					this.state.paddles.player2.y -= STEP
				}
				if ((this.keysPressed['A'] || this.keysPressed['a']) && this.state.paddles.player1.y < MAX_Y) {
					this.state.paddles.player1.y += STEP
				}
				if ((this.keysPressed['D'] || this.keysPressed['d']) && this.state.paddles.player1.y > MIN_Y) {
					this.state.paddles.player1.y -= STEP
				}
				break
		}
	}

	private cleanup() {
		this.resizeObserver?.disconnect()
		this.removePregameScreen()

		if (this.engine) {
			this.engine.stopRenderLoop();
			this.engine.dispose()
			this.engine = null
		}

		this.scene?.dispose()
		this.scene = null

		this.canvas = null
	}

	private async loadPaddle(scene: Scene):Promise<AbstractMesh> {
		try {
			const result: ISceneLoaderAsyncResult = await ImportMeshAsync(
				"../models/paddle.glb", scene
			)
			const mesh = result.meshes[0]
			return mesh
		} catch (error) {
			return MeshBuilder.CreateBox("paddle10", { width: 1, height: 10, depth: 10 }, this.scene )
		}
	}

	private async loadField(scene: Scene):Promise<AbstractMesh> {
		try {
			const result: ISceneLoaderAsyncResult = await ImportMeshAsync(
				"../models/field.glb", scene
			)
			const mesh = result.meshes[0]
			return mesh
		} catch (error) {
			return MeshBuilder.CreateBox("paddle10", { width: 1, height: 10, depth: 10 }, this.scene )
		}
	}

	// Handle Mobile Inputs
	private handlePointerDown = (e: PointerEvent) => {
		const x = e.clientX
		const screenWidth = window.innerWidth

		if (x < screenWidth / 2) {
			this.keysPressed['ArrowDown'] = true
		} else {
			this.keysPressed['ArrowUp'] = true
		}
	}

	private handlePointerUp = (e: PointerEvent) => {
		if (this.gameOver) return
		this.keysPressed['ArrowUp'] = false
		this.keysPressed['ArrowDown'] = false
	}
}
