import { User } from "./types.js";

export class Api {
	baseUrl: string;
	refreshInterval: number;
	refreshIntervalId: ReturnType<typeof setInterval> | null
	constructor() {
		this.baseUrl = '/api';
		this.refreshInterval = 13 * 60 * 1000; // 13 minutes
		this.refreshIntervalId = null;
	}

	async request(endpoint: string, options = {}) {
		const url = `${this.baseUrl}${endpoint}`;
		let res = await fetch(url, {
			...options,
			credentials: 'include',
		});

		if (res.status === 401) {
			await this.refreshToken();
			res = await fetch(url, options);
		}

		return res;
	}

	async refreshToken() {
		return await fetch(`${this.baseUrl}/refresh`, {
			method: 'POST',
			headers: {
				'X-CSRF-Token': this.getCsrfToken() || '',
			},
			credentials: 'include',
		});

		// if (!res.ok) {
		// 	console.error('Auto-refresh failed');
		// }
	}

	getCsrfToken() {
		return document.cookie
		.split('; ')
		.find(row => row.startsWith('csrf_token='))
		?.split('=')[1];
	}


	startAutoRefresh() {
		this.refreshIntervalId = setInterval(async () => {
			try {
				const res = await this.refreshToken();
				if (!res.ok) {
					console.warn('Failed to refresh token');
				}
			} catch (err) {
				console.error('Auto-refresh failed:', err);
				this.stopAutoRefresh();
			}
		}, this.refreshInterval);
	}

	stopAutoRefresh() {
		if (this.refreshIntervalId) {
			clearInterval(this.refreshIntervalId);
		}
	}

	async login(username: string, password: string) {
		const res = await this.request('/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username, password }),
		});

		if (res.ok) {
		this.startAutoRefresh();
		}
		return res;
	}

	async register(username: string, password: string) {
		return this.request('/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username, password }),
		});
	}

	async logout() {
		const res = await this.request('/logout', {
			method: 'POST',
			headers: {
				'X-CSRF-Token': this.getCsrfToken(),
			},
		});
		this.stopAutoRefresh();
		return res;
	}

	async getUser() {
		return this.request('/user');
	}

	async getProfile() {
		return this.request('/profile');
	}

	async checkAuth(): Promise<User | null> {
		try {
			const res = await this.getUser();
			if (res.ok) return await res.json();
		} catch (error) {
			console.error("Auth check failed:", error);
		}
		return null;
	}
}

// TODO:
// better error handling
