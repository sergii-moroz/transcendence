import bcrypt from 'bcrypt';
import { User } from '../types/user.js';
import { db } from '../db/connections.js';

export const findUserById = async (id: number): Promise<User | undefined> => {
	return new Promise((resolve, reject) => {
		db.get<User>(
			'SELECT * FROM users WHERE id = ?',
			[id],
			(err, row) => {
				if (err) reject(err)
				else resolve(row)
			}
		)
	})
}

export async function findUserByUsername(username: string): Promise<User | undefined> {
	return new Promise((resolve, reject) => {
		db.get<User>('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
			if (err) reject(err);
			else resolve(row);
		});
	});
}

// TODO: Why we need this function???
export async function findUserIdByUsername(username: string): Promise<number | undefined> {
	return new Promise((resolve, reject) => {
		db.get<{id: number}>('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
			if (err) reject(err);
			else resolve(row ? row.id : undefined);
		});
	});
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
	return bcrypt.compare(plainPassword, hashedPassword);
}

export const createUser = async (username: string, hashedPassword: string): Promise<number> => {
	return new Promise((resolve, reject) => {
		db.run(
			`INSERT INTO users (username, password) VALUES (?, ?)`,
			[username, hashedPassword],
			function (err) {
				if (err) return reject(err);
				resolve(this.lastID)
			}
		);
	});
}
