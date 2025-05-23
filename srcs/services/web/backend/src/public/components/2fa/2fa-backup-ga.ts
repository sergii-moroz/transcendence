const innerHTML = `
	<!-- CARD -->
	<div class="tw-card w-full p-4 space-y-4
								sm:max-w-sm sm:p-6 sm:space-y-6
								md:max-w-md"
	>

		<!-- CARD: HEADER -->
		<h1 class="text-xl text-center font-bold text-gray-700 md:text-2xl dark:text-gray-200">
				Backup verification codes
		</h1>

		<!-- CARD: CONTENT -->
		<div
			class="text-xs md:text-sm p-4 space-y-4 text-center
							border border-transparent border-y-gray-200
							sm:p-6
							md:space-y-6
							dark:border-y-gray-700"
		>
			<p>
				With 2FA enabled for your account, you'll need these backup codes if you ever lose your device.
				Without your device or backup code, you'll have to contact support team to recover your account.
			</p>
			<p>We recommend you to print them to keep in a safe place.</p>
			<div
				id="codes"
				class="grid grid-cols-2 gap-4 bg-gray-500/10 text-xs text-gray-600 px-4 py-2 rounded-sm
					border border-gray-200 dark:text-gray-200 dark:border-gray-700"
			>
				CODES HERE
			</div>

			<div>
				<button id="btn-print" class="tw-btn-outline">Print</button>
				<button id="btn-download" class="tw-btn-outline">Download (PDF)</button>
			</div>
		</div>

		<!-- CARD: FOOTER -->
		<div class="flex items-center justify-between">
			<a href="/settings" data-link class="tw-btn-outline w-24">Cancel</a>
			<button id="btn-next" class="tw-btn-disabled w-24" disabled>Next</button>
		</div>
	</div>
`

export class TwoFABackupGA extends HTMLElement {
	constructor() {
		super()
		this.render()
	}

	private render() {
		this.innerHTML = innerHTML
	}
}
