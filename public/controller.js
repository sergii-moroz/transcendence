import {
	login,
	logout,
	getUser,
	register,
	getProfile,
	refreshToken,
} from "./model.js"
import { getCsrfToken } from "./utils.js"
import { renderHome } from "./view/homeView.js"
import { renderAbout } from "./view/aboutView.js"
import { renderLogin } from "./view/loginView.js"
import { renderProfile } from "./view/profileView.js"
import { renderRegister } from "./view/registerView.js"
import { renderWaitingRoom } from "./view/waitingRoomView.js"

const REFRESH_INTERVAL = 13 * 60 * 1000; // 13 minutes
let refreshIntervalId;

const app = document.getElementById('app');

export const render = (path) => {
	if (path === '/' || path === '/login') return showLogin()
	if (path === '/register') return showRegister();
	if (path === '/home') return showHome();
	if (path === '/about') return showAbout();
	if (path === '/profile') return showProfile();
	if (path === '/waiting-room') return showWaitingRoom();
	app.innerHTML = `<h2>404 Not Found</h2>`;
}

function navigate(path) {
	history.pushState({}, '', path);
	render(path);
}

export const fetchWithRefresh = async (url, options = {}) => {
	let res = await fetch(url, options);

	if (res.status === 401) {
		const csrf = getCsrfToken();
		const res = await refreshToken(csrf);

		if (res.ok) {
			res = await fetch(url, options); // retry original request
		} else {
			// refresh failed, log out user
			navigate('/login');
			return;
		}
	}
	return res;
}

async function checkAuth() {
	try {
		const res = await getUser();
		if (res.ok) return await res.json();
	} catch {}
	return null;
}

function startAutoRefresh() {
	refreshIntervalId = setInterval(async () => {
		const csrf = getCsrfToken();

		try {
			const res = await refreshToken(csrf);

			if (!res.ok) {
				console.warn('Failed to refresh token');
			}
		} catch (err) {
			console.error('Auto-refresh failed:', err);
		}
	}, REFRESH_INTERVAL);
}

function stopAutoRefresh() {
	clearInterval(refreshIntervalId);
}

function showLogin() {
	app.innerHTML = renderLogin()

	document.getElementById('loginForm').onsubmit = async e => {
		e.preventDefault();
		const { username, password } = e.target;
		const res = await login(username.value, password.value);

		if (!res) return

		const data = await res.json();

		if (res.ok) {
			startAutoRefresh();
			navigate('/home');
		} else {
			alert(data.error);
		}
	};

	document.getElementById('register-nav').onclick = (e) => {
		e.preventDefault()
		navigate('/register')
	}
}

function showRegister() {
	app.innerHTML = renderRegister()

	document.getElementById('login-nav').onclick = (e) => {
		e.preventDefault()
		navigate('/login')
	}

	document.getElementById('registerForm').onsubmit = async e => {
		e.preventDefault();
		const { username, password } = e.target;
		const res = await register(username.value, password.value)

		if (!res) return

		const data = await res.json();
		if (res.ok) {
			startAutoRefresh();
			navigate('/home');
		} else {
			alert(data.error);
		}
	};
}

async function showHome() {
	const user = await checkAuth();
	
	if (!user) return navigate('/login');
	
	app.innerHTML = renderHome(user.user.username) // why so much user???
	
	document.getElementById('about-link').onclick = (e) => {
		e.preventDefault()
		navigate('/about')
	}
	document.getElementById('profile-link').onclick = (e) => {
		e.preventDefault()
		navigate('/profile')
	}
	document.getElementById('join').onclick = (e) => {
		e.preventDefault();
		navigate('/waiting-room')
	}
	document.getElementById('logout').onclick = async () => {
		const csrf = getCsrfToken()

		await logout(csrf)
		stopAutoRefresh()
		navigate('/login');
	};
}

function showAbout() {
	app.innerHTML = renderAbout()
	document.getElementById('home-link').onclick = (e) => {
		e.preventDefault()
		navigate('/home')
	}
}

async function showWaitingRoom() {
	app.innerHTML = renderWaitingRoom();
	const user = await checkAuth();
	const socket = io('http://localhost:4242');

	socket.emit('joinRoom', user.user.username);
	
	socket.on('joinedRoom', (message) => {
		alert(message);
		console.log(message);
	});

	socket.on('redirectingToGame', (gameRoomId) => {
		// To be implemented
		console.log(`Redirecting to game room: ${gameRoomId}`);
	});

	document.getElementById('home-link').onclick = (e) => {
		e.preventDefault();
		socket.disconnect();
		console.log('Disconnecting from socket...');
		navigate('/home');
	}
	window.addEventListener('beforeunload', () => {
		e.preventDefault();
		socket.disconnect();
		console.log('Disconnected from socket due to page unload');
	});
}

async function showProfile() {
	const res = await getProfile();
	if (!res.ok) return navigate('/login');

	const { profile } = await res.json();
	app.innerHTML = renderProfile(profile);

	document.getElementById('home-link').onclick = (e) => {
		e.preventDefault()
		navigate('/home')
	}
}

// Listen to URL changes
window.onpopstate = () => render(location.pathname);
render(location.pathname);
