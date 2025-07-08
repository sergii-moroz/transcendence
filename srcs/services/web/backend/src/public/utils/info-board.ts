import { AbstractMesh, Color3, DynamicTexture, MeshBuilder, Scene, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";

export class InfoBoard {
	private scene: Scene
	private texture: DynamicTexture | null = null
	private plane: AbstractMesh | null = null

	constructor(scene: Scene) {
			this.scene = scene;
			this.init();
	}

	private init() {
		// 1. Create plane (facing camera by default)
		this.plane = MeshBuilder.CreatePlane(
			"infoBoard",
			{ width: 500, height: 50 },
			this.scene
		);

		// 3. Create dynamic texture
		this.texture = new DynamicTexture(
			"infoTexture",
			{ width: 1280, height: 128 }, // Higher resolution for sharper text
			this.scene,
			false, // No mipmaps
			Texture.TRILINEAR_SAMPLINGMODE // Better quality
		);

		// 4. Create material
		const material = new StandardMaterial("scoreMat", this.scene);
		material.diffuseTexture = this.texture;
		material.emissiveColor = Color3.White(); // Makes text brighter
		material.specularColor = Color3.Black(); // Removes shine

		material.alpha = 1
		// material.backFaceCulling = false;
		material.diffuseTexture.hasAlpha = true
		this.plane.material = material;

	}

	public updateInfo(down: string, up: string) {
		if (!this.texture) return

		const ctx = this.texture.getContext();
		const { width, height } = this.texture.getSize();

		// Clear texture
		// ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = 'rgba(0, 0, 0, 0)';
		ctx.fillRect(0, 0, width, height);

		// Font settings
		const fontSize = 100;
		const font = `bold ${fontSize}px Arial`;
		ctx.font = font;

		// Calculate text metrics
		const centerX = width / 2;

		// Calculate vertical centering (accounts for text baseline)
		const textMetrics = ctx.measureText("M"); // Use capital M for height reference
		const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
		const textY = (height + textHeight) / 2 - textMetrics.actualBoundingBoxDescent;

		const player1Width = ctx.measureText(down).width;
		ctx.fillStyle = "white"
		ctx.fillText(down, centerX - 160 - player1Width, textY);
		ctx.fillText(up, centerX + 300 , textY);

		// Update texture
		this.texture.update(true);
	}

	public setPosition(x: number, y: number, z: number) {
		if (!this.plane) return

		this.plane.position = new Vector3(x, y, z);
	}

	public setVisibility(val: number) {
		if (!this.plane) return

		this.plane.visibility = val
	}

}
