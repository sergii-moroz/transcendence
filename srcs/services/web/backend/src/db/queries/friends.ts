import { findUserIdByUsername } from "../../services/userService.js";
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

// will be put somewhere else later
export const addFriendtoDB = async (friendName: string, invitor_id: number): Promise<void> => {
	const recipient_id = await findUserIdByUsername(friendName);
	if (!recipient_id || recipient_id == invitor_id) throw new Error("Friend is not valid to add");
	return new Promise((resolve, reject) => {
		db.run(' \
			INSERT INTO friends (invitor_id, recipient_id, status) VALUES (?, ?, "pending")',
			[invitor_id, recipient_id],
			(err) => {
				if (err) {
					console.log(err);
					if (err.message.includes('Friendship already exists') || err.message.includes('UNIQUE constraint failed'))
  						return reject(new Error("friend already exists"));
					return reject(err);
				} 
				resolve();
			}
		)
	})
}
export const removeFriend = async (friendName: string, user_id: number): Promise<void> => {
	if (friendName == OnlineUsers[0]) throw new Error("Admin Friend cant be deleted");
	const friend_id = await findUserIdByUsername(friendName);
	await new Promise<void>((resolve, reject) => {
		db.run(
			'DELETE FROM friends WHERE (invitor_id = ? AND recipient_id = ?) or (recipient_id = ? AND invitor_id = ?)',
			[friend_id, user_id, friend_id, user_id],
			function (err) {
				if (err) reject(err);
				else resolve();
			}
		);
	});
}