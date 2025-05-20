import { View } from "../view.js"

export class LoginView extends View {
	setContent = () => {
		this.element.innerHTML = `
		<div class="grid xl:grid-cols-2">
			<section>
				<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
					<a
						href="/"
						data-link
						class="flex w-full sm:max-w-sm items-center md:max-w-md mb-6 sm:mb-8 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl md:text-4xl"
					>
						<span class="text-2xl mr-2 hidden sm:block sm:text-3xl md:text-4xl">🏓</span>
						ft_transcendence
					</a>

					<div class="tw-card w-full sm:max-w-sm md:mt-0 md:max-w-md xl:p-0">
						<div class="p-6 space-y-4 md:space-y-6 sm:p-8">
							<h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
									Sign in to your account
							</h1>
							<form id="loginForm" class="space-y-4 md:space-y-6" action="#">

								<div>
									<label
										for="username"
										class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
									>
										Your Nickname
									</label>
									<input
										type="text"
										name="username"
										id="username"
										class="tw-input"
										placeholder="Nickname"
										required
										autofocus
										>
								</div>

								<div>
									<label
										for="password"
										class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
									>
										Password
									</label>
									<input
										type="password"
										name="password"
										id="password"
										placeholder="••••••••"
										class="tw-input"
										required
										>
								</div>

								<button
									type="submit"
									class="w-full text-white text-xl bg-primary hover:bg-primary/80
										font-bold rounded-md text-sm px-5 py-2.5 text-center
										focus:ring-4 focus:outline-none focus:ring-primary-300
										dark:bg-primary dark:hover:bg-primary/80 dark:focus:ring-primary/80"
									>
									Sign in
								</button>

								<p class="flex justify-between text-sm font-light text-gray-500 dark:text-gray-400">
									<span>Don't have an account yet?</span>
									<a
										href="/register"
										data-link
										class="font-medium text-primary hover:underline dark:text-primary/90"
									>
										Sign up
									</a>
								</p>
							</form>
						</div>
					</div>
				</div>
			</section>

			<div class="bg-primary hidden xl:block"></div>

		</div>
		`;
	}

	setupEventListeners() {

		this.addEventListener(document.getElementById('loginForm')!, 'submit', async (e: Event) => {
			e.preventDefault();
			const form = e.target as HTMLFormElement;
			const formData = new FormData(form);
			const data = Object.fromEntries(formData) as {
				username: string;
				password: string;
			};
			const res = await this.api.login(data.username, data.password)

			if (!res) return

			const jsonRes = await res.json();
			console.log("jsonRES:", jsonRes)

			if (res.ok && jsonRes.requires2FA) {
				sessionStorage.setItem('2fa_token', jsonRes.token)
				return this.router.navigateTo('/login/2fa/verify')
			}

			if (res.ok) {
				return this.router.navigateTo('/home');
			} else {
				alert(jsonRes.error);
				form.reset();
				return ;
			}
		});
	}
}
