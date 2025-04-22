import { fetchWithRefresh } from "./controller.js"

export const login = async (username, password) => (
	await fetch('/api/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			username: username,
			password: password,
		})
	})
)

export const register = async (username, password) => (
	await fetch('/api/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			username: username, password: password
		})
	})
)

export const logout = async (csrf) => (
	await fetch('/api/logout', {
		method: 'POST',
		headers: {
			'X-CSRF-Token': csrf
		}
	})
)

export const refreshToken = async (csrf) => (
	await fetch('/api/refresh', {
		method: 'POST',
		headers: {
			'X-CSRF-Token': csrf
		}
	})
)

export const getUser = async () => (
	await fetchWithRefresh('/api/user')
)

export const getProfile = async () => (
	await fetchWithRefresh('/api/profile')
)
