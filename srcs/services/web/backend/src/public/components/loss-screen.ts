import { Router } from "../router-static.js"
import {Engine, Scene, ArcRotateCamera, Vector3, ImportMeshAsync, HemisphericLight, Color4, AbstractMesh, HDRCubeTexture} from "@babylonjs/core"
import "@babylonjs/loaders/glTF";

export class LossScreen extends HTMLElement {
	canvas: HTMLCanvasElement | null = null;
	engine: Engine | null = null;
	scene: Scene | null = null;

	constructor() {
		super();
	}

	connectedCallback() {
		this.render();
		this.initBabylon();
	}

	render() {
		this.innerHTML = `
			<canvas id="modelCanvas" style="width: 100%; height: 40vh; display: block; outline: none;"></canvas>
		`;
	}

	initBabylon = async () => {
		this.canvas = this.querySelector("#modelCanvas");
		if (!this.canvas) {
			console.error("Canvas element not found");
			return;
		}

		this.engine = new Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
		this.scene = new Scene(this.engine);
		this.scene.clearColor = new Color4(0, 0, 0, 0);

		const hdr = new HDRCubeTexture("../textures/rostock_laage_airport_1k.hdr", this.scene, 128, false, true, false, true);
		this.scene.environmentTexture = hdr

		const camera = new ArcRotateCamera(
			"camera",
			Math.PI / 2,
			Math.PI / 2.5,
			0.5,
			Vector3.Zero(),
			this.scene
		);
		camera.attachControl(this.canvas, true);
		camera.inputs.removeByType("ArcRotateCameraMouseWheelInput");

		try {
			const result = await ImportMeshAsync("../models/aluminum_mug.glb", this.scene);
			const meshes = result.meshes.filter(mesh => mesh instanceof AbstractMesh) as AbstractMesh[];

			if (meshes.length === 0) {
				console.warn("No meshes loaded from model.");
				return;
			}

			// Compute bounding info
			let boundingInfo = meshes[0].getBoundingInfo();
			let min = boundingInfo.boundingBox.minimum.clone();
			let max = boundingInfo.boundingBox.maximum.clone();

			for (let i = 1; i < meshes.length; i++) {
				const info = meshes[i].getBoundingInfo();
				min = Vector3.Minimize(min, info.boundingBox.minimum);
				max = Vector3.Maximize(max, info.boundingBox.maximum);
			}

			// Now we have the combined bounding box
			const sizeVec = max.subtract(min);
			const maxDimension = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);

			const desiredSize = 60;
			const scaleFactor = desiredSize / maxDimension;

			// Scale and reposition model
			for (const mesh of meshes) {
				mesh.scaling.set(0.1 * scaleFactor, 0.1 * scaleFactor, 0.1 * scaleFactor);
				mesh.rotation.z = -Math.PI / 2; // -90 degrees

				// Animation parameters
				const duration = 40; // frames (about 0.7s at 60fps)
				let frame = 0;

				this.scene.onBeforeRenderObservable.add(() => {
					if (frame <= duration) {
						// Progress from 0 to 1
						const t = frame / duration;

						// Ease out (cubic)
						const ease = 1 - Math.pow(1 - t, 3);

						// Animate scaling
						const scale = 0.1 + (1 - 0.1) * ease;
						mesh.scaling.set(scale * scaleFactor, scale * scaleFactor, scale * scaleFactor);

						// Animate rotation
						mesh.rotation.z = -Math.PI / 2 * (1 - ease);

						frame++;
					}
				});
				mesh.position.z -= 15;
				//mesh.position.y += 10; // Adjust Y position to lift the model
				mesh.position.x -= 10; // Adjust X position to center the model
			}

			// Adjust camera distance based on bounding sphere
			camera.setTarget(Vector3.Zero());
			camera.radius = desiredSize * 2;

			console.log("3D model loaded and scaled successfully!");
		} catch (err) {
			console.error("Failed to load model:", err);
		}


		this.engine.runRenderLoop(() => {
			if (this.scene) this.scene.render();
		});

		window.addEventListener("resize", () => {
			this.engine?.resize();
		});
	};
}
