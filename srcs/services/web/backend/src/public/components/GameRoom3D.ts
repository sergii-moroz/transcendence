import { Camera, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, TrailMesh, UniversalCamera, Vector3 } from "@babylonjs/core"
import { gameJson, GameState } from "../types.js"
import { Router } from "../router-static.js"

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
	private ball: Mesh | null = null
	private paddle1: Mesh | null = null
	private paddle2: Mesh | null = null
	private fieldWidth = 250
	private fieldHeight = 150

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

		// Static camera setup - Orthographic projection
		const camera = new UniversalCamera("camera", new Vector3(0, 0, -400), this.scene);
		camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
		camera.orthoTop = this.fieldHeight;
		camera.orthoBottom = -this.fieldHeight;
		camera.orthoLeft = -this.fieldWidth;
		camera.orthoRight = this.fieldWidth;
		camera.rotation = new Vector3(0, 0, 0); // Lock rotation
		camera.lockedTarget = Vector3.Zero(); // Look at center

		// Alternative: Perspective camera fixed angle
		// const camera = new Camera("camera", new Vector3(0, 250, -500), this.scene);
		// // camera.setTarget(Vector3.Zero());
		// camera.fov = 0.5; // Narrow field of view

		// Lighting
		new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene)
		new HemisphericLight('light2', new Vector3(0 -1, 0), this.scene)

		// create game objects
		this.createField()
		this.createPaddles()
		this.createBall()

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
		ground.position.z = 1
		ground.rotate(new Vector3(1, 0, 0), -Math.PI/2)

		const groundMat = new StandardMaterial("groundMat", this.scene)
		groundMat.diffuseColor = new Color3(0.2, 0.2, 0.2)
		ground.material = groundMat
	}

	private createBall() {
		if (!this.scene) return

		this.ball = MeshBuilder.CreateSphere("ball", { diameter: 10 }, this.scene)
		const ballMat = new StandardMaterial("ballMat", this.scene)
		// ballMat.diffuseColor = new Color3(1, 1, 1)
		ballMat.emissiveColor = new Color3(1, 1, 1)
		ballMat.specularPower = 100
		this.ball.material = ballMat

		// Create ball trail
		this.ballTrail = new TrailMesh("ballTrail", this.ball, this.scene, 0.5, 30, true)
		const trailMat = new StandardMaterial("trailMat", this.scene)
		trailMat.emissiveColor = new Color3(0.8, 0.8, 1)
		trailMat.alpha = 0.6
		this.ballTrail.material = trailMat
	}

	private createPaddles() {
		if (!this.scene) return

		// Player 1 paddle (blue)
		this.paddle1 = MeshBuilder.CreateBox("paddle1", {
			width: 10,
			height: 60,
			depth: 5
		}, this.scene)
		this.paddle1.position.x = -this.fieldWidth + 5

		const paddle1Mat = new StandardMaterial("paddle1Mat", this.scene)
		paddle1Mat.diffuseColor = new Color3(0, 0.5, 1)
		this.paddle1.material = paddle1Mat

		// Player 2 paddle (red)
		this.paddle2 = MeshBuilder.CreateBox("paddle2", {
			width: 10,
			height: 60,
			depth: 5
		}, this.scene)
		this.paddle2.position.x = this.fieldWidth - 5

		const paddle2Mat = new StandardMaterial("paddle2Mat", this.scene)
		paddle2Mat.diffuseColor = new Color3(1, 0, 0.5)
		this.paddle2.material = paddle2Mat
	}

	private updateGameObjects() {
		if (!this.latestState || !this.ball || !this.paddle1 || !this.paddle2) return

		// update ball position
		this.ball.position.x = this.latestState.ball.x
		this.ball.position.y = this.latestState.ball.y
		this.ball.position.z = 0

		// Update paddle1
		this.paddle1.position.y = this.latestState.paddles.player1.y
		this.paddle2.position.y = this.latestState.paddles.player2.y

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

		// Handle gameover

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
					// this.socket?.send(JSON.stringify({ type: 'exit' }));
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
}
