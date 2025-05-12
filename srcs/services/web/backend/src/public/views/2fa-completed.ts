import {
	iconChevronLeft,
} from "../components/icons.js";

import { View } from "../view.js"

export class Completed2FAView extends View {
	setContent = () => {

		this.element.innerHTML = `
			<header
				class="bg-white border border-transparent shadow
					dark:bg-gray-800 dark:border-b-gray-700"
			>
				<div
					class="flex items-center justify-between py-4 px-8 md:px-11 max-w-7xl mx-auto"
				>
					<a href="/settings" data-link class="cursor-pointer hover:underline hover:decoration-2 hover:decoration-primary hover:underline-offset-4" >
						<div class="flex gap-2 items-center hover:[&_div]:bg-primary/20 hover:[&_div]:text-primary dark:hover:[&_div]:bg-gray-200 pointer-events-none" data-item-icon>
							<div class="size-8 flex items-center shadow dark:border dark:border-gray-700 justify-center rounded-full">${iconChevronLeft}</div>
							Back
						</div>
					</a>

					<div
						class="flex items-center font-bold text-gray-900
						dark:text-white
						sm:max-w-sm sm:text-lg
						md:max-w-md md:text-xl"
					>
						<span class="text-2xl mr-2 hidden sm:block sm:text-3xl md:text-4xl">🔒</span>
						<div>
							<div>Two-Factor</div>
							<div>Authentification</div>
						</div>
					</div>
				</div>
			</header>


			<section>
				<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto space-y-4">

					<!-- CARD -->
					<div class="tw-card w-full p-4 space-y-4
												sm:max-w-sm sm:p-6 sm:space-y-6
												md:max-w-md"
					>

						<!-- CARD: HEADER -->
						<h1 class="text-xl text-center font-bold text-gray-700 md:text-2xl dark:text-gray-200">
								Verified
						</h1>

						<!-- CARD: CONTENT -->
						<div
							class="text-xs md:text-sm p-4 space-y-4 text-center
											border border-transparent border-y-gray-200
											sm:p-6
											md:space-y-6
											dark:border-y-gray-700"
						>
							<p class="mx-auto">From now on you'll use Google Authenticator to sign in.</p>
							<div class="text-5xl">🎉</div>
						</div>

						<!-- CARD: FOOTER -->
						<div class="flex items-center justify-end">
							<a href="/settings" data-link class="tw-btn w-24">Done</a>
						</div>
					</div>
				</div>
			</section>
		`;
	}
}
