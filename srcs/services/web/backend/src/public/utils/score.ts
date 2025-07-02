import { AbstractMesh, Color3, DynamicTexture, MeshBuilder, Scene, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";

export class ScoreBoard {
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
			"scoreBoard",
			{ width: 500, height: 50 },
			this.scene
		);

		// 2. Rotate plane to stand upright (Y-up systems)
		this.plane.rotation.x = -Math.PI / 2; // Rotate 90 degrees around X

		// 3. Create dynamic texture
		this.texture = new DynamicTexture(
			"scoreTexture",
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
		this.plane.material = material;

	}

	public updateScore(player1Score: number, player2Score: number, player1Name: string, player2Name: string) {
		if (!this.texture) return

		const ctx = this.texture.getContext();
		const { width, height } = this.texture.getSize();

		// Clear texture
		ctx.clearRect(0, 0, width, height);

		// Font settings
		const fontSize = 100;
		const font = `bold ${fontSize}px Arial`;
		ctx.font = font;

		// Text components
		const scoreText = `${player1Score} : ${player2Score}`;
		const scoreTextWidth = ctx.measureText(scoreText).width
		const space = ctx.measureText(" ").width

		// Calculate text metrics
		const centerX = width / 2;

		// Calculate vertical centering (accounts for text baseline)
		const textMetrics = ctx.measureText("M"); // Use capital M for height reference
		const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
		const textY = (height + textHeight) / 2 - textMetrics.actualBoundingBoxDescent;

		// Draw player1 name (left, blue)
		ctx.fillStyle = "#3498db";
		const player1Width = ctx.measureText(player1Name).width;
		ctx.fillText(player1Name, centerX - scoreTextWidth/2 - player1Width - space, textY);

		// Draw score (center, white)
		ctx.fillStyle = "white";
		const scoreWidth = ctx.measureText(scoreText).width;
		ctx.fillText(scoreText, centerX - scoreWidth/2, textY);

		// Draw player2 name (right, pink)
		ctx.fillStyle = "#ff69b4";
		ctx.fillText(player2Name, centerX + scoreTextWidth/2 + space , textY);

		// Optional: Add border
		ctx.strokeStyle = "white";
		ctx.lineWidth = 10;
		ctx.strokeRect(5, 5, width - 10, height - 10);

		// Update texture
		this.texture.update();
	}

	public setPosition(x: number, y: number, z: number) {
		if (!this.plane) return

		this.plane.position = new Vector3(x, y, z);
	}

}
