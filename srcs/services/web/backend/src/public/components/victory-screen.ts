import { Router } from "../router-static.js"
import {Engine, Scene, ArcRotateCamera, Vector3, ImportMeshAsync, HemisphericLight, Color4, AbstractMesh} from "@babylonjs/core"
import "@babylonjs/loaders/glTF";

export class VictoryScreen extends HTMLElement {
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
			<canvas id="modelCanvas" style="width: 100%; height: 400px; outline: none;"></canvas>
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

		new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);

		try {
			const result = await ImportMeshAsync("../models/silver_trophy.glb", this.scene);
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
			const center = min.add(sizeVec.scale(0.5));
			const maxDimension = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);

			const desiredSize = 12;
			const scaleFactor = desiredSize / maxDimension;

			// Scale and reposition model
			for (const mesh of meshes) {
				mesh.scaling.set(scaleFactor, scaleFactor, scaleFactor);
				mesh.position.subtractInPlace(center);
			}

			// Adjust camera distance based on bounding sphere
			camera.setTarget(Vector3.Zero());
			camera.radius = desiredSize * 10;

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