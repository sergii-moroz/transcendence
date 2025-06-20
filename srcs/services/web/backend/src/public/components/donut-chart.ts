 export class ThreeRingDonut extends HTMLElement {
	static get observedAttributes() {
		return ['singleplayer', 'multiplayer', 'tournament'];
	}

	private winrates = {
		singleplayer: 0,
		multiplayer: 0,
		tournament: 0
	};

	constructor() {
		super();
	}

	connectedCallback() {
		this.winrates.singleplayer = this.getIntAttribute('singleplayer', 0);
		this.winrates.multiplayer = this.getIntAttribute('multiplayer', 0);
		this.winrates.tournament = this.getIntAttribute('tournament', 0);
		console.log(this.winrates)
		this.renderChart()
	}

	getIntAttribute(name: string, defaultValue = 0) {
		const value = this.getAttribute(name);
		console.log("value:", value)
		if (value === null) return defaultValue;

		const parsed = parseInt(value, 10);
		return isNaN(parsed) ? defaultValue : Math.min(100, Math.max(0, parsed));
	}

	private calculateDashArray(radius: number, percent: number): string {
		const circumference = 2 * Math.PI * radius;
		const filled = (percent / 100) * circumference;
		return `${filled} ${circumference}`;
	}

	private renderChart() {

		this.innerHTML = `
			<div class="flex gap-4 sm:gap-8 mb-4">

				<svg width="200" height="200" viewBox="0 0 200 200" class="size-44">
					<!-- Outer Ring -->
					<circle id="outer-bg" r="80" cx="100" cy="100" stroke="#4caf5033" stroke-width="20" fill="none"
									stroke-dasharray="${this.calculateDashArray(80, 100)}"
									transform="rotate(-90 100 100)"/>
					<circle id="outer-fill" r="80" cx="100" cy="100" stroke="#4caf50" stroke-width="20" fill="none"
									stroke-dasharray="${this.calculateDashArray(80, this.winrates.singleplayer)}"
									transform="rotate(-90 100 100)"/>

					<!-- Middle Ring -->
					<circle id="middle-bg" r="60" cx="100" cy="100" stroke="#2196f333" stroke-width="20" fill="none"
									stroke-dasharray="${this.calculateDashArray(60, 100)}"
									transform="rotate(-90 100 100)"/>
					<circle id="middle-fill" r="60" cx="100" cy="100" stroke="#2196f3" stroke-width="20" fill="none"
									stroke-dasharray="${this.calculateDashArray(60, this.winrates.multiplayer)}"
									transform="rotate(-90 100 100)"/>

					<!-- Inner Ring -->
					<circle id="inner-bg" r="40" cx="100" cy="100" stroke="#9c27b033" stroke-width="20" fill="none"
									stroke-dasharray="${this.calculateDashArray(40, 100)}"
									transform="rotate(-90 100 100)"/>
					<circle id="inner-fill" r="40" cx="100" cy="100" stroke="#9c27b0" stroke-width="20" fill="none"
									stroke-dasharray="${this.calculateDashArray(40, this.winrates.tournament)}"
									transform="rotate(-90 100 100)"/>
				</svg>

				<div class="flex flex-col justify-center text-xs sm:text-sm md:text-base space-y-2">
					<div class="flex items-center">
						<span class="inline-block size-3 bg-green-500 rounded-full mr-1 sm:mr-2"></span>
						<span>Singleplayer</span>
					</div>
					<div>
						<span class="inline-block size-3 bg-blue-500 rounded-full mr-1 sm:mr-2"></span>
						<span>Multiplayer</span>
					</div>
					<div>
						<span class="inline-block size-3 bg-purple-500 rounded-full mr-1 sm:mr-2"></span>
						<span>Tournament</span>
					</div>
				</div>
			</div>
		`;
	}

}
