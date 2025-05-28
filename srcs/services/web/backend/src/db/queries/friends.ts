import { Friend, User } from "../../types/user.js";
import { db } from "../connections.js";


export const getFriendRequests = async (id: number): Promise<Friend[] | undefined> => {
	return new Promise((resolve, reject) => {
		db.all<Friend>(' \
			SELECT username as name, avatar as picture from friends f \
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

// hardcoded rn
const OnlineUsers: string[] = [
	'dolifero',
	'smoroz'
]

export const getOnlineFriends = async (id: number): Promise<Friend[]> => {
	return new Promise((resolve, reject) => {
		db.all<Friend>(' \
			SELECT username as name, avatar as picture from friends f \
			JOIN users u on u.id = \
				case \
					when f.invitor_id = ? then f.recipient_id \
					else f.invitor_id \
				end \
			WHERE (invitor_id = ? and status = "accepted") or (recipient_id = ? and status = "accepted") \
			ORDER by created_at',
			[id, id, id],
			(err, rows) => {
				if (err) return reject(err);
				// if (rows.length === 0) return resolve(undefined);

				// console.log(`aa: `, rows.filter(row => OnlineUsers.includes(row.name)));
				const answer = rows.filter(row => OnlineUsers.includes(row.name)).map(row => ({
					name: row.name,
					picture: row.picture
				}));
				resolve(answer);
		})
	})
}