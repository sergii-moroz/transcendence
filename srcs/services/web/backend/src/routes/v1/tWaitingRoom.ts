import {
	FastifyInstance,
	FastifyPluginOptions,
	FastifyRequest
} from "fastify"

import { Tournament } from "../../services/tournament.js";

export const tWaitingRoomSock = async (app: FastifyInstance) => {
	const tWaitingRoomConns = new Map<string, WebSocket>();

	app.get('/tournament-waiting-room', {websocket: true }, async (socket, req) => {
			let userId: string = req.user.id.toString();
	
			socket.on('message', (messageBuffer: Event) => {
				const message = JSON.parse(messageBuffer.toString());
	
				if(message.type === 'joinRoom') {
					console.custom('INFO', `${userId} has joined the waiting room`);
					
					if(!tWaitingRoomConns.has(userId!)) {
						tWaitingRoomConns.set(userId!, socket);
					}
					else {
						tWaitingRoomConns.set(userId!, socket);
						console.custom('INFO', `${userId} is already in the waiting room`);
					}
	
					console.custom('INFO', 'Users in tournament waiting room:', [...tWaitingRoomConns.keys()]);
	
					socket.send(JSON.stringify({
						type: 'joinedRoom',
						message: `You have joined tournament waiting room`
					}));
	
					if (tWaitingRoomConns.size >= 4) {
						const tournament = new Tournament(app);
						app.tournaments.set(tournament.id, tournament);
						redirectToTournament(tournament.id, app, tWaitingRoomConns);
					}
				}
			})
	
			socket.on('close', () => {
				if (userId && tWaitingRoomConns.has(userId)) {
					tWaitingRoomConns.delete(userId);
				}
			})
	
			socket.on('error', (err: Event) => {
				console.custom('error', err);
			})
		});
}

function redirectToTournament(tournamentId: string, app: FastifyInstance, tWaitingRoomConns: Map<string, WebSocket>) {
	console.custom('INFO', 'Two users are in the waiting room, redirecting to tournament room...')

	const users = Array.from(tWaitingRoomConns).slice(0, 4);
	users.forEach((user) => tWaitingRoomConns.delete(user[0]));

	const message = JSON.stringify({
		type: 'redirectingToTournament',
		tournamentId: tournamentId,
		message: `Redirecting to tournament: ${tournamentId}`
	});
	
	users.forEach((user) => {
		user[1].send(message);
	})

	console.custom('INFO', 'Users redirected to tournament room:', users.map(user => user[0]));
}