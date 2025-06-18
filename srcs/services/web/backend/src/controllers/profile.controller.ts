import { FastifyReply, FastifyRequest } from "fastify";
import { getProfileData, setNewAvatar } from "../services/profile.services.js";
import { join } from "node:path";
import { createWriteStream } from "node:fs";
import { pipeline } from 'stream/promises';
import { FileInvalid, FileTypeInvalid } from "../errors/friends.error.js";

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

const UPLOAD_DIR = '/uploads/';

export const handleNewAvatar = async (
	req:		FastifyRequest,
	reply:	FastifyReply
) => {
	try {
		const data = await req.file();
		if (!data)
			throw new FileInvalid

		const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
		const fileExtension = data.filename.split('.').pop()?.toLowerCase();
		if (!fileExtension || !allowedMimeTypes.includes(data.mimetype)) throw new FileTypeInvalid

		const fileName = `avatar_${req.user.username}.${fileExtension}`;
		const filePath = join(UPLOAD_DIR, fileName);
		const fullPath = join(process.cwd(), '/dist/public', filePath);
		// console.log(filePath);
		// console.log(fullPath);
		const writeStream = createWriteStream(fullPath); //also write to src or just to dist?
		await pipeline(data.file, writeStream);

		await setNewAvatar(filePath, req.user.id);

		reply.status(200).send({success: true, url: filePath});
	} catch (error) {
		throw error;
	}
}