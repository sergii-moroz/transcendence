import { db } from "../connections.js";
import bcrypt from 'bcrypt'

export async function up() {
	return new Promise<void>((resolve, reject) => {

		db.serialize(() => {
			const hashed = bcrypt.hashSync("password", 10);
			for (let i=0; i<100; i++) {
				db.run(
					`INSERT INTO users (username, password, bio) VALUES (?, ?, ?)`,
					[`test-${i}`, hashed, `About user test-${i}`],
					(err) => {
						if (err) reject(err);
					}
				);
			}
			resolve(); // call once after all .run() calls
		});
	});
}
