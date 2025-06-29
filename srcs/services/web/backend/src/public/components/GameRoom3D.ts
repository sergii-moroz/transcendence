import { AbstractMesh, ArcRotateCamera,
	Camera,
	Color3,
	Color4,
	Engine,
	HDRCubeTexture,
	ImportMeshAsync,
	ISceneLoaderAsyncResult,
	Material,
	Matrix,
	Mesh,
	MeshBuilder,
	PBRMaterial,
	Scene,
	Space,
	StandardMaterial,
	Texture,
	TrailMesh,
	UniversalCamera,
	Vector3
} from "@babylonjs/core"

import { gameJson, GameState } from "../types.js"
import { Router } from "../router-static.js"
import { HitEffect } from "../utils/hit-effect.js"
import { clamp, loadRandomCharacter } from "../utils/utils.js"

export class Game3D extends HTMLElement {
	private gameRoomId: string | null = null
	private socket: WebSocket | null = null
	private latestState: GameState | null = null
	private gameOver: boolean = false
	private gameOverMessage: { message: string, winner: string } | null = null
	private ballTrail: TrailMesh | null = null

	// Babylon.js components
	private canvas: HTMLCanvasElement | null = null
	private engine: Engine | null = null
	private scene: Scene | null = null
	private resizeObserver: ResizeObserver | null = null

	// Game objects
	private ball: AbstractMesh | null = null
	private character1: AbstractMesh | null = null
	private character2: AbstractMesh | null = null
	private paddle1: AbstractMesh | undefined = undefined
	private paddle2: AbstractMesh | null = null
	private fieldWidth = 250
	private fieldHeight = 150

	private hitEffect: HitEffect | null = null

	constructor() {
		super()
	}

	connectedCallback() {
		this.gameRoomId = window.location.pathname.split('/')[2]
		this.render()
		this.handleSocket()
		this.initializeScene()
		document.addEventListener('keydown', this.handleUserInput)
	}

	disconnectedCallback() {
		this.cleanup()
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.close()
		}
		document.removeEventListener('keydown', this.handleUserInput)
	}

	private render() {
		this.innerHTML = `
		<div class="relative z-0">
			<canvas class="w-full h-full block "></canvas>
			<!-- HUD Overlay -->
			<div class="absolute inset-0 pointer-events-none z-10">
				<!-- Score Display -->
				<div class="flex justify-between p-5 w-full">
					<!-- Player 1 Score -->
					<div class="bg-black bg-opacity-50 text-white px-5 py-3 rounded-md border-2 border-blue-400 min-w-[120px] text-center">
						<div id="player1-score" class="text-4xl font-bold">0</div>
						<div id="player1-name" class="text-base mt-1">Player 1</div>
					</div>

					<!-- Player 2 Score -->
					<div class="bg-black bg-opacity-50 text-white px-5 py-3 rounded-md border-2 border-pink-500 min-w-[120px] text-center">
						<div id="player2-score" class="text-4xl font-bold">0</div>
						<div id="player2-name" class="text-base mt-1">Player 2</div>
					</div>
				</div>

				<!-- Game Message Center -->
				<div id="game-message" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
					bg-black bg-opacity-70 text-white px-10 py-5 rounded-xl text-center max-w-[80%] hidden">
					<h2 class="text-2xl font-bold mb-2" id="message-text"></h2>
					<h3 class="text-xl" id="winner-text"></h3>
					<p class="mt-3">Redirecting in 3 seconds...</p>
				</div>
			</div></div>
		`
	}

	private async initializeScene() {
		this.canvas = this.querySelector('canvas')
		if (!this.canvas) return

		// Initialize Babylon.js engine
		this.engine = new Engine(this.canvas, true, {
			preserveDrawingBuffer: true,
			stencil: true
		})
		this.scene = new Scene(this.engine)

		// Static camera setup
		// const camera = new UniversalCamera("camera", new Vector3(0, 0, -400), this.scene);
		// camera.mode = Camera.PERSPECTIVE_CAMERA
		// camera.rotation = new Vector3(0, 0, 0); // Lock rotation
		// camera.lockedTarget = Vector3.Zero(); // Look at center

		const camera = new ArcRotateCamera(
			"camera",
			-Math.PI / 2,
			Math.PI / 2.5,
			400,
			Vector3.Zero(),
			this.scene
		);
		camera.attachControl(this.canvas, true);

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

		// Handle resize
		this.resizeObserver = new ResizeObserver(() => {
			this.engine?.resize()
		})
		this.resizeObserver.observe(this.canvas)

		// Run render loop
		this.engine.runRenderLoop(() => {
			this.scene?.render()
			this.updateGameObjects()
		})
	}

	private createField() {
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
		const ground = MeshBuilder.CreateGround("ground", {
			width: this.fieldWidth * 2,
			height: this.fieldHeight * 2
		}, this.scene)
		ground.position.z = 30
		ground.rotate(new Vector3(1, 0, 0), -Math.PI/2)

		const groundPBR = new PBRMaterial("groundPBR", this.scene)
		groundPBR.albedoColor = new Color3(0.2, 0.2, 0.2)
		groundPBR.metallic = 0.0
		groundPBR.roughness = 0.5
		ground.material = groundPBR
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

		// Update scores
		const player1Score = this.querySelector('#player1-score');
		const player2Score = this.querySelector('#player2-score');
		const player1Name = this.querySelector('#player1-name');
		const player2Name = this.querySelector('#player2-name');

		if (player1Score && player2Score && player1Name && player2Name) {
			player1Score.textContent = this.latestState.scores.player1.toString();
			player2Score.textContent = this.latestState.scores.player2.toString();
			player1Name.textContent = this.latestState.scores.user1;
			player2Name.textContent = this.latestState.scores.user2;
		}

		if (this.latestState.hit) {
			this.hitEffect?.playHitEffect({
				x: this.latestState.ball.x,
				y: this.latestState.ball.y
			})
		}

	}

	handleSocket = () => {
		this.socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/ws/game/${this.gameRoomId}`);

		this.socket.onopen = () => {
			console.log('WebSocket connection established.');
		}

		this.socket.onmessage = (event) => {
			const data = JSON.parse(event.data) as gameJson;

			if (data.type === 'gameState') {
				this.latestState = data.state as GameState;
			}

			if (data.type === 'Error') {
				this.socket?.send(JSON.stringify({ type: 'exit' }));
				alert(data.message);
				console.error('WebSocket error:', data.message);
				Router.navigateTo('/home');
			}

			if (data.type === 'victory') {
				this.gameOver = true;
				this.gameOverMessage = {
					message: data.message as string,
					winner: data.winner as string
				};
				console.log('Game over:', data.message, data.winner, data.tournamentId);
				setTimeout(() => {
					if(data.tournamentId !== null) {
						console.log("Redirecting to tournament:", data.tournamentId);
						Router.navigateTo(`/tournament/${data.tournamentId}`);
					} else {
						Router.navigateTo('/victory-screen');
					}
				}, 3000);
			}

			if (data.type === 'defeat') {
				this.gameOver = true;
				this.gameOverMessage = {
					message: data.message as string,
					winner: data.winner as string
				};
				console.log('Game over:', data.message, data.winner, data.tournamentId);
				setTimeout(() => {
					// this.socket?.send(JSON.stringify({ type: 'exit' }));
					Router.navigateTo('/loss-screen');
				}, 3000);
			}
		};

		this.socket.onclose = () => {
			console.log("WebSocket connection got closed by server");
		};

		this.socket.onerror = (err: Event) => {
			this.socket?.send(JSON.stringify({ type: 'exit' }));
			alert(`WebSocket error: ${err}`);
			console.error('WebSocket error:', err);
			Router.navigateTo('/home');
		};
	}

	handleUserInput = (e: KeyboardEvent) => {
		if (this.gameOver) return;
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				this.socket.send(JSON.stringify({ type: 'input', input: 'down' }));
			}
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				this.socket.send(JSON.stringify({ type: 'input', input: 'up' }));
			}
		}
	};

	private cleanup() {
		this.resizeObserver?.disconnect()
		if (this.engine) {
			this.engine.dispose()
			this.engine = null
		}
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
}
