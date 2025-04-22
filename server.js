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
	return jwt.sign({ id: user.id, username: user.username }, 'refresh-secret', { expiresIn: '7d' });
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

app.listen({ port: 4242 })
