export class API {
	static baseUrl: string
	static refreshInterval: number
	static refreshIntervalId: ReturnType<typeof setInterval> | null

	static async request(endpoint: string) {
		// const url = `${this.baseUrl}${endpoint}`
		const res = await fetch(endpoint, {
			credentials: 'include'
		})

		return res
	}

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
	static async post(endpoint: string, data: object) {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify(data)
		});
		return response;
	}

	static async login(username: string, password: string) {
		const response = await this.post('/api/login', { username, password })
		console.log("API: login:", response)

		if (response.ok && response.status === 202) return response.json()

		if (response.ok) {
			// this.startAutoRefresh()
		}
		return response.json()
	}

	// static async login2FAVerify(code: string) {
	// 	const token = sessionStorage.getItem('temp2faToken')
	// 	const res = await this.post('/api/2fa/verify-login', {token, code}) // rename to /api/login/2fa/verify
	// 	return res.json()
	// }

	static async register(username: string, password: string, repeated: string) {
		const response = await this.post('/api/register', { username, password, repeated })
		console.log("API: register:", response)
		return response.json()
	}

	// static async is2FAEnabled() {
	// 	return this.request('/api/2fa/enable')
	// }
}
