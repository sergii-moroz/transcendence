import { ErrorResponse } from "../types/errors.js";
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

	async request(endpoint: string,
		// options: = {}
		options: RequestInit & { headers?: Record<string, string> } = {}
	) {
		const url = `${this.baseUrl}${endpoint}`;
		let res = await fetch(url, {
			...options,
			credentials: 'include',
		});

		if (!res.ok) {
			const errorRes = res.clone();
			const errorData: ErrorResponse = await errorRes.json();
			console.log("error data:", errorData);
			if (errorData.code !== 'FST_2FA_INVALID_CODE') {
				await this.refreshToken()

				if (options.headers && options.headers['X-CSRF-Token']) {
					options.headers['X-CSRF-Token'] = this.getCsrfToken();
				}

				res = await fetch(url, {
					...options,
					credentials: 'include'
				});
			}
		}

		// if (res.status === 401) {
		// 	await this.refreshToken();
		// 	res = await fetch(url, options);
		// }

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
		?.split('=')[1] || '';
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

	// Two Factor Authentification

	/**
	 * Retrieves a QR code and secret for 2FA registration.
	 * Makes an authenticated POST request to the '/2fa/register' endpoint.
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
	async getQR() {
		const res = await this.request('/2fa/register', {
			method: 'POST',
			headers: {
				'X-CSRF-Token': this.getCsrfToken(),
			},
		});
		return res;
	}

	/**
	 * Verifies a 2FA (Two-Factor Authentication) code with the server.
	 *
	 * Makes an authenticated POST request to the '/2fa/verify' endpoint with the provided code.
	 * The request includes CSRF protection and sends the code as JSON payload.
	 *
	 * @param {string} code - The 2FA verification code to validate (typically a 6-digit TOTP code)
	 **/
	async verify2FA(code: string) {
		const res = await this.request('/2fa/verify', {
			method: 'POST',
			headers: {
				'X-CSRF-Token': this.getCsrfToken(),
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({ code })
		})
		return res
	}

	/**
	 * Requests new 2FA backup codes from the server.
	 *
	 * Makes an authenticated POST request to the '/2fa/backup-codes' endpoint to generate
	 * new backup codes for two-factor authentication. The request includes CSRF protection
	 * and requires valid credentials.
	 *
	 * @returns {Promise<Response>} A promise that resolves with the server response containing:
	 *	- `codes`: string[] (Array of backup codes)
	 * @example
	 * const response = await instanceApi.request2FABackupCodes();
	 *	if (response.ok) {
	 *		const data = await response.json()
	 *		console.log('Backup codes:', data.codes);
	 *	}
	 **/
	async create2FABackupCodes() {
		const res = await this.request('/2fa/backup-codes', {
			method: 'POST',
			headers: {
				'X-CSRF-Token': this.getCsrfToken(),
			},
			credentials: 'include'
		})
		return res
	}
}

// TODO:
// better error handling
