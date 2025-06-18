import { db } from "../db/connections.js";
import { UserNotFoundError } from "../errors/login.errors.js";
import { profileData } from "../public/types/game-history.types.js";

const DEFAULT_PICTURE_PATH = "/uploads/default.jpg";

export const getProfileData = async (name: string): Promise<profileData> => {
	const data = await new Promise<profileData>((resolve, reject) => {
		db.get<profileData>(' \
			SELECT username, avatar, funFact, created_at_user as registerDate from users \
			WHERE username = ?',
			[name],
			(err, row) => {
				if (err) return reject(err);
				if (!row) reject(new UserNotFoundError);
				resolve(row);
		})
	})
	if (!data.avatar) data.avatar = DEFAULT_PICTURE_PATH;

	return data;
}