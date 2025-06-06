import {
	FastifyInstance,
	FastifyPluginOptions,
	FastifyRequest
} from "fastify"

import { Tournament } from "../../services/tournament.js";
import { send } from "process";

export const tournamentListSock = async (app: FastifyInstance) => {
	const tournamentListConns = new Array<[string, WebSocket]>();

	app.get('/tournament-list', {websocket: true }, async (socket, req) => {
		let userId: string = req.user.id.toString();

		connectUser(userId, socket);
		console.custom('INFO', 'Users in tournament waiting room:', tournamentListConns.map(player => player[0]));

		sendTournamentList(tournamentListConns, app);

		socket.on('message', (messageBuffer: Event) => {
			const message = JSON.parse(messageBuffer.toString());

			if(message.type === 'createTournament') {
				const tournament = new Tournament(app, message.maxPlayers || 4);
				app.tournaments.set(tournament.id, tournament);
				console.custom('INFO', `Tournament created with ID: ${tournament.id}`);
				redirectToTournament(tournament.id, app, {id: userId, socket: socket}, tournamentListConns);
				setTimeout(() => {
					sendTournamentList(tournamentListConns, app);
				}, 500);
			}

			if(message.type === 'joinTournament') {
				console.custom('INFO', `User ${userId} is joining tournament: ${message.tournamentId}`);
				const tournamentId = message.tournamentId;
				redirectToTournament(tournamentId, app, {id: userId, socket: socket}, tournamentListConns);
				setTimeout(() => {
					sendTournamentList(tournamentListConns, app);
				}, 500);
			}
		})

		socket.on('close', () => {
			const index = tournamentListConns.findIndex(([id]) => id === userId);
			if (index !== -1) {
				tournamentListConns.splice(index, 1);
			}
		})

		socket.on('error', (err: Event) => {
			console.custom('error', err);
		})
	});

	function connectUser(userId: string, socket: WebSocket) {
		const index = tournamentListConns.findIndex(([id]) => id === userId);
		if(index === -1) {
			tournamentListConns.push([userId, socket]);
			console.custom('INFO', `${userId} has joined the tournament waiting room`);
		} else {
			tournamentListConns[index][1] = socket;
			console.custom('INFO', `${userId} is already in the tournament waiting room, socket updated`);
		}
	}
}

function redirectToTournament(tournamentId: string, app: FastifyInstance,
	user: {id: string, socket: WebSocket}, tournamentListConns: Array<[string, WebSocket]>) {
	if(!app.tournaments.has(tournamentId)) {
		console.custom('ERROR', 'Tournament not found:', tournamentId);
		return;
	}

	const message = JSON.stringify({
		type: 'redirectingToTournament',
		tournamentId: tournamentId,
		message: `Redirecting to tournament: ${tournamentId}`
	});
	user.socket.send(message);

	console.custom('INFO', 'Users redirected to tournament room:', user.id);
	const index = tournamentListConns.findIndex(([id]) => id === user.id);
	if (index !== -1) {
		tournamentListConns.splice(index, 1);
	}
}

function sendTournamentList(connections: Array<[string, WebSocket]>, app: FastifyInstance) {
	let tournamentList = Array.from(app.tournaments.values()).map(tournament => ({
		id: tournament.id,
		maxPlayers: tournament.maxPlayers,
		playerCount: tournament.players.length,
	}));
	connections.forEach(([userId, socket]) => {
		socket.send(JSON.stringify({
			type: 'tournamentList',
			tournaments: tournamentList,
		}));
		console.custom('INFO', `Sent tournament list to user ${userId}`);
	});
}
