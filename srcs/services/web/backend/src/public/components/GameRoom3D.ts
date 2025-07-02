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

	constructor() {
		super()
	}

	connectedCallback() {
		this.gameRoomId = window.location.pathname.split('/')[2]
		this.render()
		this.handleSocket()
		this.initializeScene()
		document.addEventListener('keydown', this.handleKeyDown);
		document.addEventListener('keyup', this.handleKeyUp);
	}

	disconnectedCallback() {
		this.cleanup()
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.close()
		}
		document.removeEventListener('keydown', this.handleKeyDown);
		document.removeEventListener('keyup', this.handleKeyUp);
	}

	private render() {
		this.innerHTML = `
			<div class="relative z-0">
				<canvas class="w-full h-full block "></canvas>
			</div>
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

		// Handle resize
		this.resizeObserver = new ResizeObserver(() => {
			this.engine?.resize()
		})
		this.resizeObserver.observe(this.canvas)

		// Run render loop
		this.engine.runRenderLoop(() => {
			this.scene?.render()
			this.updateGameObjects()
			this.sendInput();
		})
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

			if (data.type === 'closed') {
				this.socket?.send(JSON.stringify({ type: 'exit' }));
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
			console.log("WebSocket connection got closed by server");
		};

		this.socket.onerror = (err: Event) => {
			this.socket?.send(JSON.stringify({ type: 'exit' }));
			alert(`WebSocket error: ${err}`);
			console.error('WebSocket error:', err);
			Router.navigateTo('/home');
		};
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
		// if (this.keysPressed['ArrowUp'] || this.keysPressed['ArrowRight']) {
		// 	this.socket.send(JSON.stringify({ type: 'input', input: 'down' }));
		// }
		// if (this.keysPressed['ArrowDown'] || this.keysPressed['ArrowLeft']) {
		// 	this.socket.send(JSON.stringify({ type: 'input', input: 'up' }));
		// }
	}

	private cleanup() {
		this.resizeObserver?.disconnect()

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
}
