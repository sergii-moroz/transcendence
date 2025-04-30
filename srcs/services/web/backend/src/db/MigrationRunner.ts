import { db } from './connections.js';
import path from 'path';
import fs from 'fs';

export class MigrationRunner {
	private migrationsDir: string;

	constructor(migrationsPath: string = './dist/db/migrations') {
		this.migrationsDir = path.resolve(migrationsPath);
	}

	async ensureMigrationsTable() {
		return new Promise<void>((resolve, reject) => {
			db.run(`
				CREATE TABLE IF NOT EXISTS migrations_run (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					name TEXT UNIQUE NOT NULL,
					run_on DATETIME DEFAULT CURRENT_TIMESTAMP
				)
			`, (err) => {
				if (err) reject(err);
				else resolve();
			});
		});
	}

	async hasMigrationRun(name: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			db.get('SELECT 1 FROM migrations_run WHERE name = ?', [name], (err, row) => {
				if (err) return reject(err);
				resolve(!!row);
			});
		});
	}

	async markAsRun(name: string) {
		return new Promise<void>((resolve, reject) => {
			db.run('INSERT INTO migrations_run (name) VALUES (?)', [name], (err) => {
				if (err) reject(err);
				else resolve();
			});
		});
	}

	getMigrationFiles(): string[] {
		return fs.readdirSync(this.migrationsDir).filter(f => f.endsWith('.js'));
	}

	async runMigrations() {
		await this.ensureMigrationsTable();

		const files = this.getMigrationFiles();
		for (const file of files) {
			const alreadyRun = await this.hasMigrationRun(file).catch(() => false);
			if (alreadyRun) {
				console.log(`✔ Skipping already run migration: ${file}`);
				continue;
			}

			console.log(`⏳ Running migration: ${file}`);
			try {
				const { up } = await import(`./migrations/${file}`);
				if (typeof up === 'function') {
					await up();
					await this.markAsRun(file);
					console.log(`✅ Migration applied: ${file}`);
				} else {
					console.warn(`⚠ Migration file ${file} does not export an 'up' function`);
				}
			} catch (err) {
				console.error(`❌ Error running migration ${file}:`, err);
				throw err;
			}
		}
	}
}
