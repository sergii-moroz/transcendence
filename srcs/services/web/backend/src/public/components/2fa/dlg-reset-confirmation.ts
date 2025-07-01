export class DlgResetConfirmation extends HTMLElement {
	constructor() {
		super()
		this.render()
	}

	private render() {
		this.innerHTML = `
			<!-- CARD -->
			<div class="tw-card w-full p-4 space-y-4
										sm:max-w-sm sm:p-6 sm:space-y-6
										md:max-w-md"
			>

				<!-- CARD: HEADER -->
				<h1 class="text-xl text-center font-bold text-gray-700 md:text-2xl dark:text-gray-200">
						Confirmation
				</h1>

				<!-- CARD: CONTENT -->
				<div
					class="text-xs md:text-sm p-4 space-y-4 text-center
									border border-transparent border-y-gray-200
									sm:p-6
									md:space-y-6
									dark:border-y-gray-700"
				>
					<p class="mx-auto">Password was changed successfully</p>
					<div class="text-5xl">🎉</div>
				</div>

				<!-- CARD: FOOTER -->
				<div class="flex items-center justify-end">
					<a href="/profile" data-link class="tw-btn w-24">Done</a>
				</div>
			</div>
		`
	}
}
