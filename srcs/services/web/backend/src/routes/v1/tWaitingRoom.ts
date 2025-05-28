import {
	FastifyInstance,
	FastifyPluginOptions,
	FastifyRequest
} from "fastify"

import { Tournament } from "../../services/tournament.js";

export const tWaitingRoomSock = async (app: FastifyInstance) => {
	const tWaitingRoomConns = new Array<[string, WebSocket]>();

	app.get('/tournament-waiting-room', {websocket: true }, async (socket, req) => {
			let userId: string = req.user.id.toString();
	
			socket.on('message', (messageBuffer: Event) => {
				const message = JSON.parse(messageBuffer.toString());
	
				if(message.type === 'joinRoom') {
					if(tWaitingRoomConns.findIndex(([id]) => id === userId) === -1) {
						tWaitingRoomConns.push([userId!, socket]);
						console.custom('INFO', `${userId} has joined the tournament waiting room`);
					} else {
						const index = tWaitingRoomConns.findIndex(([id]) => id === userId);
						tWaitingRoomConns[index][1] = socket;
						console.custom('INFO', `${userId} is already in the tournament waiting room, socket updated`);
					}
	
					console.custom('INFO', 'Users in tournament waiting room:', tWaitingRoomConns.map(player => player[0]));
	
					socket.send(JSON.stringify({
						type: 'joinedRoom',
						message: `You have joined tournament waiting room`
					}));
	
					if (tWaitingRoomConns.length >= 4) {
						const tournament = new Tournament(app);
						app.tournaments.set(tournament.id, tournament);
						redirectToTournament(tournament.id, app, tWaitingRoomConns);
					}
				}
			})
	
			socket.on('close', () => {
				const index = tWaitingRoomConns.findIndex(([id]) => id === userId);
				if (index !== -1) {
					tWaitingRoomConns.splice(index, 1);
				}
			})
	
			socket.on('error', (err: Event) => {
				console.custom('error', err);
			})
		});
}

function redirectToTournament(tournamentId: string, app: FastifyInstance, tWaitingRoomConns: Array<[string, WebSocket]>) {
	console.custom('INFO', 'Two users are in the waiting room, redirecting to tournament room...')
	if(!app.tournaments.has(tournamentId)) {
		console.custom('ERROR', 'Tournament not found:', tournamentId);
		return;
	}
	const users = [];
	let length = tWaitingRoomConns.length;
	for (let i = 0; i < length; i++) {
		users.push(tWaitingRoomConns.shift()!);
	}

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