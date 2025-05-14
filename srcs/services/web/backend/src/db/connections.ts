import sqlite3 from 'sqlite3';

const DB_FILE = './dist/db/db.sqlite'

export const db = new sqlite3.Database(DB_FILE)
