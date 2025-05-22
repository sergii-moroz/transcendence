const compHTML = `
	<!-- CARD -->
	<div class="tw-card w-full p-4 space-y-4
								sm:max-w-sm sm:p-6 sm:space-y-6
								md:max-w-md"
	>

		<!-- CARD: HEADER -->
		<h1 class="text-xl text-center font-bold text-gray-700 md:text-2xl dark:text-gray-200">
				Register App
		</h1>

		<!-- CARD: CONTENT -->
		<div
			class="text-xs md:text-sm text-center p-4 space-y-4
							border border-transparent border-y-gray-200
							sm:p-6
							md:space-y-6
							dark:border-y-gray-700"
		>
			<p>Open the Google Autenticator app and scan QR code</p>
			<div>
				<img src="" alt="2FA QR Code" class="mx-auto rounded-md" />
			</div>
			<p>Or enter the following code manually:</p>
			<p id="secret" class="font-bold text-base"></p>
			<p class="max-w-sm">Once App is registered, you'll start seeing 6-digit verification codes in the app</p>
		</div>

		<!-- CARD: FOOTER -->
		<div class="flex items-center justify-between">
			<a href="/settings" data-link class="tw-btn-outline w-24">Cancel</a>
			<a href="/settings/2fa/verify" data-link class="tw-btn w-24">Next</a>
		</div>
	</div>
`
// ${data.qr}
// ${formatString(data.secret)}

export class TwoFARegisterGA extends HTMLElement {
	constructor() {
		super()
		this.innerHTML = compHTML
	}

	connectedCallback() {

	}

	disconnectedCallback() {

	}


}
