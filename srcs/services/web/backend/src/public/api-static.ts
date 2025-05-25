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
