import { Friend, User } from "../../types/user.js";
import { db } from "../connections.js";


export const getFriendRequests = async (id: number): Promise<Friend[]> => {
	return new Promise((resolve, reject) => {
		db.all<Friend>(' \
			SELECT username as name, avatar as picture from friends f \
			JOIN users u on f.invitor_id = u.id \
			WHERE recipient_id = ? and status = "pending" \
			ORDER by created_at',
			[id],
			(err, rows) => {
				if (err) return reject(err);
				resolve(rows);
		})
	})
}

// hardcoded right now
const OnlineUsers: string[] = [
	'dolifero',
	'smoroz'
]

export const getFriendList = async (id: number): Promise<{online: Friend[], offline: Friend[]}> => {
	const allFriends = await new Promise<Friend[]>((resolve, reject) => {
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
				resolve(rows);
		})
	})
	return {
		online: allFriends.filter(friend => OnlineUsers.includes(friend.name)),
		offline: allFriends.filter(friend => !OnlineUsers.includes(friend.name))
	};
}