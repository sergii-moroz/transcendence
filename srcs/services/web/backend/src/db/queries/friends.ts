import { findUserIdByUsername } from "../../services/userService.js";
import { Friend, FriendChat, User } from "../../types/user.js";
import { db } from "../connections.js";


export const getFriendRequests = async (id: number): Promise<Friend[]> => {
	return new Promise((resolve, reject) => {
		db.all<Friend>(' \
			SELECT username as name, avatar as picture from friends f \
			JOIN users u on f.inviter_id = u.id \
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
	'admin',
	'dolifero',
]

export const getFriendList = async (id: number): Promise<{online: Friend[], offline: Friend[]}> => {
	const allFriends = await new Promise<Friend[]>((resolve, reject) => {
		db.all<Friend>(' \
			SELECT username as name, avatar as picture from friends f \
			JOIN users u on u.id = \
				case \
					when f.inviter_id = ? then f.recipient_id \
					else f.inviter_id \
				end \
			WHERE (inviter_id = ? and status = "accepted") or (recipient_id = ? and status = "accepted") \
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
export const addFriendtoDB = async (friendName: string, inviter_id: number): Promise<void> => {
	const recipient_id = await findUserIdByUsername(friendName);
	if (!recipient_id || recipient_id == inviter_id) throw new Error("Friend is not valid to add");
	return new Promise((resolve, reject) => {
		db.run(' \
			INSERT INTO friends (inviter_id, recipient_id, status) VALUES (?, ?, "pending")',
			[inviter_id, recipient_id],
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
			'DELETE FROM friends WHERE (inviter_id = ? AND recipient_id = ?) or (recipient_id = ? AND inviter_id = ?)',
			[friend_id, user_id, friend_id, user_id],
			function (err) {
				if (err) reject(err);
				else resolve();
			}
		);
	});
}

export const getFriendChat = async (friendName: string, user_id: number): Promise<FriendChat> => {
	const friend_id = await findUserIdByUsername(friendName);
	if (!friend_id) throw new Error("friend does not exist");
	const FriendData = await new Promise<Friend & { blocked_by_inviter: string | null, blocked_by_recipient: string | null, inviter_id: number, recipient_id: number }>((resolve, reject) => {
		db.get<Friend & { blocked_by_inviter: string | null, blocked_by_recipient: string | null, inviter_id: number, recipient_id: number }>(' \
			SELECT username as name, avatar as picture, blocked_by_inviter, blocked_by_recipient, recipient_id, inviter_id from friends f \
			JOIN users u on u.id = \
				case \
					when f.inviter_id = ? then f.recipient_id \
					else f.inviter_id \
				end \
			WHERE (inviter_id = ? and recipient_id = ? and status = "accepted") or (recipient_id = ? and inviter_id = ? and status = "accepted") \
			ORDER by created_at',
			[user_id, friend_id, user_id, friend_id, user_id],
			(err, row) => {
				if (err) return reject(err);
				if (!row) return reject(new Error("friend not found"));
				resolve(row);
		})
	})

	const blockStatus = (FriendData.inviter_id == user_id ? FriendData.blocked_by_inviter : FriendData.blocked_by_recipient)

	return {
		name: FriendData.name,
		picture: FriendData.picture,
		blocked: blockStatus,
		online: OnlineUsers.includes(FriendData.name)
	};
}