import { Color4, ParticleSystem, Scene, Texture, Vector3 } from "@babylonjs/core";

export class HitEffect {
	private hitParticleSystem: ParticleSystem | null = null
	private scene: Scene

	constructor(scene: Scene) {
		this.scene = scene
		this.initializeHitParticles()
	}

	private initializeHitParticles() {
		// Create particle system
		this.hitParticleSystem = new ParticleSystem('hitParticles', 200, this.scene)

		// Configure particle texture (spark or glow texture)
		this.hitParticleSystem.particleTexture = new Texture('../textures/sparkle.png', this.scene)

		// Basic particle configuration
		this.hitParticleSystem.minSize = 1.0
		this.hitParticleSystem.maxSize = 5.0
		this.hitParticleSystem.minLifeTime = 0.3
		this.hitParticleSystem.maxLifeTime = 0.8
		this.hitParticleSystem.emitRate = 1000
		this.hitParticleSystem.blendMode = ParticleSystem.BLENDMODE_ADD

		// Color gradients (from white to blue)
		this.hitParticleSystem.color1 = new Color4(1, 1, 1, 1)
		this.hitParticleSystem.color2 = new Color4(0.5, 0.5, 1.0, 0.8)
		this.hitParticleSystem.colorDead = new Color4(0.2, 0.2, 1.0, 0)

		// Emission area (small sphere around hit point)
		this.hitParticleSystem.createSphereEmitter(20.0)

		// Movement behavior
		this.hitParticleSystem.minEmitPower = 0.5
		this.hitParticleSystem.maxEmitPower = 2
		this.hitParticleSystem.gravity = Vector3.Zero()

		// Start in stopped state
		this.hitParticleSystem.stop()
	}

	public playHitEffect(position: {x: number, y: number}): void {
		if (!this.hitParticleSystem) return
		// Position the emitter at hit location
		this.hitParticleSystem.emitter = new Vector3(position.x, position.y, 0.0)

		// Start the particle burst
		this.hitParticleSystem.start()

		// Automatically stop after short duration
		setTimeout(() => {
			this.hitParticleSystem?.stop()
		}, 200)
	}
}
