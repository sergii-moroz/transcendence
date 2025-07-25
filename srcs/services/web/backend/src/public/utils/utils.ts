import { AbstractMesh, ImportMeshAsync, ISceneLoaderAsyncResult, Scene, Space, Vector3 } from "@babylonjs/core";

export const formatString = (str: string, groupSize: number = 4, separator: string = "-"): string => {
	if (str.length === 0) {
		return "";
	}
	// if (groupSize <= 0) {
	// 	throw new RangeError("Group size must be greater than 0");
	// }
	const regex = new RegExp(`.{1,${groupSize}}`, "g");
	const groups = str.match(regex);
	return groups ? groups.join(separator) : str;
	// return str.match(new RegExp(`.{1,${groupSize}}`, "g")).join(separator);
	};

export const generateBackupCodesImage = (codes: string[]) => {
	// Create canvas
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	// ts guard
	if (!ctx) return

	// Calculate canvas size needed
	const lineHeight = 24;
	const margin = 20;
	const title = 'Backup Verification Codes'
	ctx.font = 'bold 18px Arial';
	const titleWidth = ctx.measureText(title).width;

	ctx.font = '16px Arial';
	const maxNumberedCodeWidth = Math.max(...codes.map((code, i) =>
		ctx.measureText(`${i+1}. ${code}`).width
	));
	const canvasWidth = Math.max(titleWidth, maxNumberedCodeWidth) + (margin * 2);
	const canvasHeight = (codes.length * lineHeight) + (margin * 2) + 40; // +40 for title

	// Set canvas dimensions
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

	// Draw background
	ctx.fillStyle = 'white';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Draw title
	ctx.fillStyle = 'black';
	ctx.font = 'bold 18px Arial';
	ctx.textAlign = 'center';
	ctx.fillText(title, canvas.width / 2, margin + 18);

	// Draw codes
	ctx.font = '16px Arial';
	ctx.textAlign = 'left';
	codes.forEach((code, i) => {
		const y = margin + 40 + (i * lineHeight);
		ctx.fillText(`${i + 1}. ${code}`, margin, y);
	});

	// Convert to image and download
	canvas.toBlob(blob => {
		if (!blob) return // ts guard
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `backup-codes-${Date.now()}.png`;
		a.click();
		URL.revokeObjectURL(url);
	}, 'image/png');
}

export const clamp = (value: number, min: number, max: number) => {
	return Math.min(Math.max(value, min), max)
}

export const loadRandomCharacter = async (scene: Scene): Promise<AbstractMesh> => {
	// Generate random character suffix (a-r)
	const randomChar = String.fromCharCode(97 + Math.floor(Math.random() * 18))
	const modelPath = `../models/characters/character-${randomChar}.glb`

	try {
		const result: ISceneLoaderAsyncResult = await ImportMeshAsync(
			modelPath, scene
		)
		const mesh = result.meshes[0]

		mesh.position = Vector3.Zero()
		mesh.scaling = new Vector3(20, 20, 20)

		mesh.rotate(new Vector3(1, 0, 0), -Math.PI / 2, Space.WORLD);

		return mesh
	} catch (error) {
		console.error("Failed to load character:", error)
		throw error
	}
}
