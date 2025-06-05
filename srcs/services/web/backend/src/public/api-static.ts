export class API {
	static baseUrl: string
	static refreshInterval: number
	static refreshIntervalId: ReturnType<typeof setInterval> | null

	// ==========================================
	// GET REQUEST
	// ==========================================

	/**
	 * Performs a GET request to the specified endpoint.
	 * Automatically attempts to refresh the access token and retry the request
	 * if the response indicates an expired or missing access token.
	 *
	 * @param endpoint - The API endpoint to send the GET request to.
	 * @returns A Promise resolving to the parsed JSON response.
	 */
	static async get(endpoint: string) {
		const response = await this.tryWithRefresh(
			async () => await fetch(endpoint, { credentials: 'include'})
		)

		return response.json()
	}

	// ==========================================
	// POST REQUEST
	// ==========================================

	/**
	 * Performs a POST request to the specified endpoint with the provided data.
	 * Automatically attempts to refresh the access token and retry the request
	 * if the response indicates an expired or missing access token.
	 *
	 * @param endpoint - The API endpoint to send the POST request to.
	 * @param data - The request payload to be sent in the body.
	 * @param opts - Optional settings (e.g., whether to include CSRF token).
	 * @returns A Promise resolving to the raw fetch Response object.
	 */
	static async post(endpoint: string, data: object, opts: { includeCSRF?: boolean} = {}) {
		const response = await this.tryWithRefresh(
			async () => {
				const postRequestInit = this.postRequestInit(data, opts)
				return await fetch(endpoint, postRequestInit);
			}
		)

		return response;
	}

	/**
	 * Sends a login request to the server with the provided credentials.
	 * Automatically handles token refresh if the access token is expired or missing.
	 *
	 * @param username - The user's username.
	 * @param password - The user's password.
	 * @returns A Promise resolving to the parsed JSON response from the server.
	 */
	static async login(username: string, password: string) {
		const response = await this.post('/api/login', { username, password })

		// if (response.ok && response.status === 202) return response.json()

		// if (response.ok) {
		// 	this.startAutoRefresh()
		// }
		return response.json()
	}

	/**
	 * Sends a register request to the server with the provided credentials.
	 * Automatically handles token refresh if the access token is expired or missing.
	 *
	 * @param username - The user's username.
	 * @param password - The user's password.
	 * @param repeated - The user's repeated password.
	 * @returns A Promise resolving to the parsed JSON response from the server.
	 */
	static async register(username: string, password: string, repeated: string) {
		const response = await this.post('/api/register', { username, password, repeated })
		return response.json()
	}

	/**
	 * Sends a logout request to the server with the provided credentials.
	 * Automatically handles token refresh if the access token is expired or missing.
	 *
	 * @returns A Promise resolving to the parsed JSON response from the server.
	 */
	static async logout() {
		const response = await this.post('/api/logout', {}, { includeCSRF: true })
		return response.json()
	}

	/**
	 * Retrieves a QR code and secret for 2FA registration.
	 * Makes an authenticated POST request to the '/2fa/register-ga' endpoint.
	 *
	 * @returns {Promise<{qr: string, secret: string}>} A promise that resolves with an object containing:
	 *									- qr: Base64 encoded QR code image data (as a data URL)
	 *									- secret: The 2FA secret key in plain text
	 * @throws Error when request fails or CSRF token is unavailable
	 * @example
	 * try {
	 *	const { qr, secret } = await instance.getQR();
	 *	console.log('QR data URL:', qr);
	 *	console.log('Secret key:', secret);
	 * } catch (error) {
	 *	console.error('Failed to get QR code:', error);
	 * }
	 **/
	static async getQR() {
		const response = await this.post('/api/2fa/ga/register', {}, { includeCSRF: true })
		return response.json()
	}

	static async twoFAGAVerify(code: string) {
		const response = await this.post('/api/2fa/ga/verify', { code }, { includeCSRF: true })
		return response.json()
	}

	static async create2FABackupCodes() {
		const response = await this.post('/api/2fa/backup-codes', {}, { includeCSRF: true })
		return response.json()
	}

	static async is2FAEnabled() {
		return this.get('/api/2fa/enabled')
	}

	static async set2FAEnabled() {
		const response = await this.post('/api/2fa/enabled', {}, { includeCSRF: true })
		return response.json()
	}

	static async twoFALoginVerify(code: string) {
		const token = sessionStorage.getItem('temp2faToken')
		const res = await this.post('/api/2fa/login/verify', {token, code})
		return res.json()
	}

	static async disable2FA(code: string) {
		const response = await this.post('/api/2fa/disable', { code }, { includeCSRF: true })
		return response.json()
	}

	static async getUserPerformance() {
		const response = await this.get('/api/stats/user/performance')
		return response
	}

	static async getTopPlayers() {
		const response = await this.get('/api/stats/top-players')
		return response
	}

	// ==========================================
	// PRIVATE: HELPERS
	// ==========================================

	/**
	 * Attempts to execute the provided `fn` function, which should return a `fetch` response.
	 *
	 * If the response has a 401 status and the JSON body includes one of the following custom error codes:
	 * - `FST_MIDDLEWARE_ACCESS_TOKEN_EXPIRED`
	 * - `FST_MIDDLEWARE_NO_ACCESS_TOKEN`
	 *
	 * Then it will attempt to refresh the access token. If the refresh is successful,
	 * the original function `fn` is retried once.
	 *
	 * This utility is useful for automatically recovering from expired or missing access tokens
	 * in GET/POST API calls.
	 *
	 * @param fn A function that returns a `Promise<Response>`, typically a fetch call.
	 * @returns A `Promise<Response>` resolving to either the original or retried response.
	 */
	private static async tryWithRefresh(fn: () => Promise<Response>) {
		const response = await fn()

		if (response.status === 401) {
			const contentType = response.headers.get('Content-Type')
			const error = contentType?.includes('application/json')
				? await response.clone().json().catch(() => null)
				: null

			if (error?.code === 'FST_MIDDLEWARE_ACCESS_TOKEN_EXPIRED' || error?.code === 'FST_MIDDLEWARE_NO_ACCESS_TOKEN') {
				const refreshed = await this.refreshToken()
				if (refreshed) {
					return await fn()
				}
			}
		}

		return response
	}

	/**
	 * Prepares a `RequestInit` configuration object for a POST request using `fetch`.
	 *
	 * This includes setting the request method, headers (including `Content-Type` and optional CSRF token),
	 * credentials for cookie inclusion, and a stringified JSON body.
	 *
	 * @param data - The data to be sent in the request body.
	 * @param opts - Optional configuration. If `includeCSRF` is `true`, the CSRF token will be added to the headers.
	 * @returns A `RequestInit` object suitable for use with a `fetch` POST request.
	 */
	private static postRequestInit = (data: object, opts: { includeCSRF?: boolean} = {}): RequestInit => {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json'
		}

		if (opts.includeCSRF) {
			const csrfToken = this.getCSRFToken()
			if (csrfToken) headers['X-CSRF-Token'] = csrfToken
		}

		return {
			method: 'POST',
			headers: headers,
			credentials: 'include',
			body: JSON.stringify(data)
		}
	}

	/**
	 * Attempts to refresh the access token by making a POST request to the refresh endpoint.
	 *
	 * Sends an empty POST body but includes the CSRF token in the request headers (if available).
	 * If the request is successful (`res.ok` is true), the function returns `true`.
	 * If the request fails or an error is thrown, it gracefully returns `false`.
	 *
	 * @returns A boolean indicating whether the token refresh was successful.
	 */
	private static async refreshToken() {
		const postRequestInit = this.postRequestInit({}, {includeCSRF: true})

		try {
			const res = await fetch('/api/refresh', postRequestInit)
			return res.ok
		} catch (err) {
			return false
		}
	}

	/**
	 * Retrieves the CSRF token stored in the browser's cookies.
	 *
	 * Searches the `document.cookie` string for a cookie named `csrf_token`
	 * and extracts its value. If the cookie is not found, an empty string is returned.
	 *
	 * @returns {string} The CSRF token value or an empty string if not present.
	 */
	private static getCSRFToken() {
		return document.cookie
			.split('; ')
			.find(row => row.startsWith('csrf_token='))
			?.split('=')[1] || '';
	}



	static async getHome() {
		try {
			const res = await this.get('/api/home');
			return res;
		} catch (error) {
			console.error("Home API call failed:", error);
			return null;
		}
	}

	static async getFriendList() {
		try {
			const res = await this.get('/api/friendList');
			return res;
		} catch (error) {
			console.error("Sidebar API call failed:", error);
			return null;
		}
	}

	static async getInitChatData(name: string) {
		try {
			const res = await this.post('/api/chatInit', {name});
			if (!res.ok) {
				console.error("Add Friend API call failed");
				return null;
			}

			return res.json();
		} catch (error) {
			console.error("Chat Sidebar API call failed:", error);
			return null;
		}
	}

	static async addFriend(name: string) {
		try {
			const res = await this.post('/api/addFriend', {name});
			return res.json();
		} catch (error) {
			console.error("Add Friend API call failed:", error);
		}
	}

	static async acceptFriend(name: string) {
		try {
			const res = await this.post('/api/acceptFriend', {name});
			if (!res.ok)
				console.error("Accept Friend API call failed");
		} catch (error) {
			console.error("Accept Friend API call failed:", error);
		}
	}

	static async rejectFriend(name: string) {
		try {
			const res = await this.post('/api/rejectFriend', {name});
			if (!res.ok)
				console.error("reject Friend API call failed");
		} catch (error) {
			console.error("reject Friend API call failed:", error);
		}
	}

	static async deleteFriend(name: string) {
		try {
			const res = await this.post('/api/deleteFriend', {name});
			if (!res.ok)
				console.error("delete Friend API call failed");
		} catch (error) {
			console.error("delete Friend API call failed:", error);
		}
	}

	static async blockFriend(name: string) {
		try {
			const res = await this.post('/api/blockFriend', {name});
			if (!res.ok)
				console.error("delete Friend API call failed");
		} catch (error) {
			console.error("delete Friend API call failed:", error);
		}
	}

	static async unblockFriend(name: string) {
		try {
			const res = await this.post('/api/unblockFriend', {name});
			if (!res.ok)
				console.error("delete Friend API call failed");
		} catch (error) {
			console.error("delete Friend API call failed:", error);
		}
	}

}
