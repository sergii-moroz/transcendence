import { Friend, User } from "../../types/user.js";
import { db } from "../connections.js";


export const getFriendRequests = async (id: number): Promise<Friend[] | undefined> => {
	return new Promise((resolve, reject) => {
		db.all<Friend>(
			'SELECT username as name, avatar as picture from friends f \
			 JOIN users u on f.invitor_id = u.id \
			 WHERE recipient_id = ? and status = "pending" \
			 ORDER by created_at',
			[id],
			(err, rows) => {
				if (err) return reject(err);
				if (rows.length === 0) return resolve(undefined);

				const answer = rows.map(row => ({
					name: row.name,
					picture: row.picture
				}));
				resolve(answer);
		})
	})
}