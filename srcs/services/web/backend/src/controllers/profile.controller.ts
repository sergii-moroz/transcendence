import { FastifyReply, FastifyRequest } from "fastify";
import { getProfileData } from "../services/profile.services.js";

export const handleGetProfileData = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	try {
		const profileName = (req.body as { name: string }).name;

		const data = await getProfileData(profileName);
		const answer = {
			avatar: data.avatar,
			username: data.username,
			registerDate: data.registerDate,
			funFact: data.funFact,
			success: true
		}
		reply.status(200).send(answer);
	} catch (error) {
		throw error;
	}
}