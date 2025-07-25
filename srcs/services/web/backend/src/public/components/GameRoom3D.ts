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

export class Game3D extends HTMLElement {
	private gameRoomId: string | null = null
	private socket: WebSocket | null = null
	private latestState: GameState | null = null
	private gameOver: boolean = false
	private gameOverMessage: { message: string, winner: string } | null = null
	private ballTrail: TrailMesh | null = null
	private keysPressed: { [key: string]: boolean } = {};

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

	private homeBtn: HTMLElement | null = null
	private preGameScreen: HTMLElement | null = null;

	constructor() {
		super()
	}

	connectedCallback() {
		this.gameRoomId = window.location.pathname.split('/')[2]
		this.render()
		this.handleSocket()
		this.initializeScene()
		this.homeBtn = this.querySelector("#home-btn");
		this.homeBtn?.addEventListener('click', this.handleBackHome);
		window.addEventListener("popstate", this.handleBackHome);
		document.addEventListener('keydown', this.handleKeyDown);
		document.addEventListener('keyup', this.handleKeyUp);
		if(this.engine?.hostInformation.isMobile) {
			document.addEventListener('pointerdown', this.handlePointerDown)
			document.addEventListener('pointerup', this.handlePointerUp)
		}
	}

	disconnectedCallback() {
		if(this.engine?.hostInformation.isMobile) {
			document.removeEventListener('pointerdown', this.handlePointerDown)
			document.removeEventListener('pointerup', this.handlePointerUp)
		}
		this.cleanup()
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.close()
		}
		this.homeBtn?.removeEventListener('click', this.handleBackHome);
		window.removeEventListener("popstate", this.handleBackHome);
		document.removeEventListener('keydown', this.handleKeyDown);
		document.removeEventListener('keyup', this.handleKeyUp);
	}

	private render() {
		this.innerHTML = `
			<div class="relative z-0 w-full">
           		<canvas class="w-full h-full block"></canvas>
			</div>
			<div class="flex justify-center mt-2">
				<a id='home-btn' class="tw-btn w-20 my-2">
					Home
				</a>
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
		// console.log(this.engine.hostInformation.isMobile)

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

		// this.scene.activeCamera = camera2

		// const camera = new ArcRotateCamera(
		// 	"camera",
		// 	-Math.PI / 2,
		// 	Math.PI / 2.5,
		// 	400,
		// 	Vector3.Zero(),
		// 	this.scene
		// );
		// camera.attachControl(this.canvas, true);

		// Lighting
		const hdr = new HDRCubeTexture("../textures/citrus_orchard_road_puresky_1k.hdr", this.scene, 128, false, true, false, true);
		const rotationMatrix = Matrix.RotationX(Math.PI / 2);
		hdr.coordinatesMode = Texture.PROJECTION_MODE;
		hdr.getReflectionTextureMatrix().multiplyToRef(rotationMatrix, hdr.getReflectionTextureMatrix());

		this.scene.environmentTexture = hdr
		// const skybox = this.scene.createDefaultSkybox(hdr, true, 1000, 0, true)
		// if (!skybox) return
		// skybox.rotation.x = -Math.PI / 2
		// this.scene.environmentIntensity = 1.0;

		// create game objects
		this.createField()
		// this.createPaddles()
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
			this.updateGameObjects()
			this.sendInput();
		})
	}

	private createPregameScreen() {
		if (!this.canvas) return;

		this.preGameScreen = document.createElement('div');
		this.preGameScreen.className = `flex flex-col z-10 absolute inset-0 bg-black/50 justify-center items-center text-white text-2xl`;

		const waitingText = document.createElement('div');
		waitingText.className = 'text-center font-bold';
		waitingText.id = 'waiting-text';
		waitingText.textContent = 'Waiting for other player to join...';

		const countdownText = document.createElement('div');
		countdownText.className = `text-4xl font-bold mt-4 hidden`;
		countdownText.id = 'countdown-text';

		this.preGameScreen.appendChild(waitingText);
		this.preGameScreen.appendChild(countdownText);
		this.canvas.parentElement?.appendChild(this.preGameScreen);
	}

	private updateCountdown(count: number | undefined) {
		if (!this.preGameScreen) return;

		const waitingText = this.preGameScreen.querySelector('#waiting-text') as HTMLElement;
		const countdownText = this.preGameScreen.querySelector('#countdown-text') as HTMLElement;

		if (waitingText && countdownText && count) {
			waitingText.textContent = 'Game starts in...';
			countdownText.style.display = 'block';
			countdownText.textContent = count.toString();
		}
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

	private updateGameObjects() {
		if (!this.latestState || !this.ball || !this.character1 || !this.character2) return
		if (!this.paddle1 || !this.paddle2) return

		// update ball position
		this.ball.position.x = this.latestState.ball.x
		this.ball.position.y = this.latestState.ball.y
		this.ball.position.z = 0

		// Update paddles
		this.character1.position.y = this.latestState.paddles.player1.y
		this.character2.position.y = this.latestState.paddles.player2.y

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

		this.scoreBoard?.updateScore(this.latestState.scores.player1, this.latestState.scores.player2, this.latestState.scores.user1, this.latestState.scores.user2)

		if (this.latestState.hit) {
			this.hitEffect?.playHitEffect({
				x: this.latestState.ball.x,
				y: this.latestState.ball.y
			})
		}

	}

	handleSocket = async () => {
		const res = await API.ping()
		if (!res.success) return;
		this.socket = new WebSocket(`wss://${window.location.hostname}:${window.location.port}/ws/game/${this.gameRoomId}`);

		this.socket.onopen = () => {
			console.log('Game: WebSocket connection established.');
		}

		this.socket.onmessage = (event) => {
			const data = JSON.parse(event.data) as gameJson;

			if (data.type === 'countdown') {
				this.updateCountdown(data.count);
			}

			if (data.type === 'gameState') {
				this.removePregameScreen()
				this.latestState = data.state as GameState;
			}

			if (data.type === 'Error') {
				console.error('Game3D: WebSocket error:', data.message);
				Router.navigateTo('/home');
			}

			if (data.type === 'closed') {
				this.socket?.send(JSON.stringify({ type: 'deleteGameBeforeStart' }));
				alert(data.message);
				Router.navigateTo('/home');
			}

			if (data.type === 'victory') {
				this.gameOver = true;
				this.gameOverMessage = {
					message: data.message as string,
					winner: data.winner as string
				};
				// console.log('Game over:', data.message, data.winner, data.tournamentId);
				if (data.tournamentId !== null) {
					console.log("Redirecting to tournament:", data.tournamentId);
					Router.navigateTo(`/tournament/${data.tournamentId}`);
				} else {
					Router.navigateTo('/victory-screen');
					}
			}

			if (data.type === 'defeat') {
				this.gameOver = true;
				this.gameOverMessage = {
					message: data.message as string,
					winner: data.winner as string
				};
				// console.log('Game over:', data.message, data.winner, data.tournamentId);
				Router.navigateTo('/loss-screen');
			}
		};

		this.socket.onclose = () => {
			console.log('Game: WebSocket connection closed.');
		};

		this.socket.onerror = (err: Event) => {
			console.error('Game3D: WebSocket error:', err);
			Router.navigateTo('/home');
		};
	}

	handleBackHome = () => {
		if (!this.latestState) //if game hasnt started
			this.socket?.send(JSON.stringify({ type: 'deleteGameBeforeStart' }));
		Router.navigateTo('/home');
	}

	handleKeyDown = (e: KeyboardEvent) => {
		if (!this.scene || this.gameOver) return;
		// if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
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
		// }
	};

	handleKeyUp = (e: KeyboardEvent) => {
		if (this.gameOver) return;
		// if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
			e.preventDefault();
			this.keysPressed[e.key] = false;
		// }
	};

	sendInput = () => {
		if (this.gameOver || !this.socket || !this.scene?.activeCamera) return

		const activeCameraName = this.scene.activeCamera.name
		switch (activeCameraName) {
			case "camera-1":
				if (this.keysPressed['ArrowUp']) {
					this.socket.send(JSON.stringify({ type: 'input', input: 'down' }));
				}
				if (this.keysPressed['ArrowDown']) {
					this.socket.send(JSON.stringify({ type: 'input', input: 'up' }));
				}
				break
			case "camera-2":
				if (this.keysPressed['ArrowRight']) {
					this.socket.send(JSON.stringify({ type: 'input', input: 'down' }));
				}
				if (this.keysPressed['ArrowLeft']) {
					this.socket.send(JSON.stringify({ type: 'input', input: 'up' }));
				}
				break
			case "camera-3":
				if (this.keysPressed['ArrowRight']) {
					this.socket.send(JSON.stringify({ type: 'input', input: 'up' }));
				}
				if (this.keysPressed['ArrowLeft']) {
					this.socket.send(JSON.stringify({ type: 'input', input: 'down' }));
				}
				break
		}
	}

	private cleanup() {
		this.resizeObserver?.disconnect()
		this.removePregameScreen()

		if (this.engine) {
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
