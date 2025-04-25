import fastifyStatic from '@fastify/static';
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken'
import Fastify from 'fastify'
import sqlite3 from 'sqlite3'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'

const REFRESH_SECRET = 'refresh-secret';
const DB_FILE = './db.sqlite'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = Fastify({logger: true})

app.register(fastifyCookie, {
	secret: 'cookiesecret-key-cookiesecret-key',
});
app.register(fastifyJwt, {
	secret: 'supersecret-key-supersecret-key!'
})

// === HELPERS ===
function generateAccessToken(user) {
	return app.jwt.sign({ id: user.id, username: user.username }, { expiresIn: '15m' });
}

function generateRefreshToken(user) {
	return jwt.sign({ id: user.id, username: user.username }, REFRESH_SECRET, { expiresIn: '7d' });
}

function createCsrfToken() {
	return crypto.randomBytes(24).toString('hex');
}

function checkCsrf(request, reply, done) {
	const csrfCookie = request.cookies.csrf_token;
	const csrfHeader = request.headers['x-csrf-token'];

	if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
		return reply.code(403).send({ error: 'CSRF token mismatch' });
	}

	done();
}

// Serve static frontend
app.register(fastifyStatic, {
	root: path.join(__dirname, 'public'),
	prefix: '/',
	// wildcard: false
})

if (!fs.existsSync(DB_FILE)) {
	const db = new sqlite3.Database(DB_FILE)
	db.serialize(() => {
		db.run(`
			CREATE TABLE users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				username TEXT UNIQUE NOT NULL,
				password TEXT NOT NULL,
				bio TEXT DEFAULT 'Hello, I am new here!'
			)
		`)
		const hashed = bcrypt.hashSync('password', 10)
		db.run(`
			INSERT INTO users (username, password, bio) VALUES (?, ?, ?)`,
			['admin', hashed, 'This is the admin profile.']
		)
	})
}

const db = new sqlite3.Database(DB_FILE)

// Utility to protect routes
app.decorate("authenticate", async (request, reply) => {
	const token = request.cookies.token;
	if (!token) return reply.code(401).send({ error: 'Unauthorized' });

	try {
		request.user = app.jwt.verify(token);
	} catch (err) {
		return reply.code(401).send({ error: 'Token expired' });
	}
});

// API: Register
app.post('/api/register', async (req, reply) => {
	const { username, password } = req.body;
	const hashed = await bcrypt.hash(password, 10);

	try {
		const userId = await new Promise((resolve, reject) => {
			db.run(
				`INSERT INTO users (username, password) VALUES (?, ?)`,
				[username, hashed],
				function (err) {
					if (err) return reject(err);
					resolve(this.lastID); // grab new user ID
				}
			);
		});

		const user = { id: userId, username };
		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);
		const csrfToken = createCsrfToken();

		return reply
			.setCookie('token', accessToken, {
				httpOnly: true,
				secure: false, // set to true in production with HTTPS
				sameSite: 'Strict',
				path: '/',
				maxAge: 60 * 15 // 15 min
			})
			.setCookie('refreshToken', refreshToken, {
				httpOnly: true,
				sameSite: 'Strict',
				path: '/',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			})
			.setCookie('csrf_token', csrfToken, {
				httpOnly: false,
				sameSite: 'Strict',
				path: '/',
				maxAge: 60 * 15
			})
			.send({ success: true });
		// return reply.send({ token });

	} catch (err) {
		console.error('Register error:', err);
		return reply.code(400).send({ error: 'User already exists or error occurred' });
	}
});

// API: Login
app.post('/api/login', async (req, reply) => {
	const { username, password } = req.body;

	try {
		const user = await new Promise((resolve, reject) => {
			db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
				if (err) return reject(err);
				resolve(row);
			});
		});

		if (!user) return reply.code(401).send({ error: `User ${username} is not found` });

		const valid = await bcrypt.compare(password, user.password);
		if (!valid) return reply.code(401).send({ error: 'Invalid credentials' });

		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);
		const csrfToken = createCsrfToken();

		return reply
			.setCookie('token', accessToken, {
				httpOnly: true,
				secure: false, // set to true in production with HTTPS
				sameSite: 'Strict',
				path: '/',
				maxAge: 60 * 15 // 15 min
			})
			.setCookie('refreshToken', refreshToken, {
				httpOnly: true,
				sameSite: 'Strict',
				path: '/',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			})
			.setCookie('csrf_token', csrfToken, {
				httpOnly: false,
				sameSite: 'Strict',
				path: '/',
				maxAge: 60 * 15
			})
			.send({ success: true });

	} catch (err) {
		console.error('Login error:', err);
		return reply.code(500).send({ error: 'Internal server error' });
	}
});

// API: Get current user info
app.get('/api/user', { preHandler: [app.authenticate] }, (req, reply) => {
	reply.send(req.user);
});

// API: Get user profile
app.get('/api/profile', { preHandler: [app.authenticate] }, (req, reply) => {
	db.get(`SELECT username, bio FROM users WHERE id = ?`, [req.user.id], (err, user) => {
		if (err || !user) return reply.code(404).send({ error: 'Not found' });
		reply.send({ profile: user });
	});
});

// SPA fallback
app.setNotFoundHandler((req, reply) => {
	if (req.raw.method === 'GET' && !req.raw.url.startsWith('/api')) {
		return reply.type('text/html').send(fs.readFileSync(path.join(__dirname, 'public/index.html')));
	}
	reply.status(404).send({ error: 'Not found' });
});

app.post('/api/refresh', async (req, reply) => {
	const refreshToken = req.cookies.refreshToken;
	if (!refreshToken) return reply.code(401).send({ error: 'No refresh token' });

	try {
		const payload = jwt.verify(refreshToken, REFRESH_SECRET);
		const accessToken = generateAccessToken(payload);
		const csrfToken = createCsrfToken();

		reply
			.setCookie('token', accessToken, {
				httpOnly: true,
				sameSite: 'Strict',
				path: '/',
				maxAge: 60 * 15
			})
			.setCookie('csrf_token', csrfToken, {
				httpOnly: false,
				sameSite: 'Strict',
				path: '/',
				maxAge: 60 * 15
			})
			.send({ success: true });
	} catch (err) {
		return reply.code(401).send({ error: 'Invalid or expired refresh token' });
	}
});

// API: Logout
app.post('/api/logout', {
	preHandler: [app.authenticate, checkCsrf]
}, (req, reply) => {
	reply
		.clearCookie('token', { path: '/' })
		.clearCookie('refreshToken', { path: '/' })
		.clearCookie('csrf_token', { path: '/' })
		.send({ success: true });
});

app.listen({ port: 4242 })
