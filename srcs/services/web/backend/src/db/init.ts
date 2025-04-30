import { MigrationRunner } from './MigrationRunner.js';

const DB_FILE = './dist/db/db.sqlite'

export const initializeDB = async () => {
	const runner = new MigrationRunner();
  await runner.runMigrations();
}
