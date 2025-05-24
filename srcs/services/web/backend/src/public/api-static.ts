export class API {
	static baseUrl: string
	static refreshInterval: number
	static refreshIntervalId: ReturnType<typeof setInterval> | null

	/**
	 * GET REQUEST
	 * @param endpoint Fetching endpoint
	 */
	static async get(endpoint: string) {
		const response = await fetch(endpoint, {
			credentials: 'include'
		});
		return response.json();
	}

	/**
	 * POST REQUEST
	 * @param endpoint
	 * @param data Data sended to the endpoint
	 * @returns response.json()
	 */
	static async post(endpoint: string, data: object, opts: { includeCSRF?: boolean} = {}) {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json'
		}

		if (opts.includeCSRF) {
			const csrfToken = this.getCSRFToken()
			if (csrfToken) headers['X-CSRF-Token'] = csrfToken
		}

		const response = await fetch(endpoint, {
			method: 'POST',
			headers: headers,
			credentials: 'include',
			body: JSON.stringify(data)
		});

		return response;
	}

	static async login(username: string, password: string) {
		const response = await this.post('/api/login', { username, password })

		if (response.ok && response.status === 202) return response.json()

		if (response.ok) {
			// this.startAutoRefresh()
		}
		return response.json()
	}

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

	static getCSRFToken() {
		return document.cookie
		.split('; ')
		.find(row => row.startsWith('csrf_token='))
		?.split('=')[1] || '';
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

}
