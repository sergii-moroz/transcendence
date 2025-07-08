import {
	FastifyInstance,
	FastifyPluginOptions,
	FastifyRequest
} from "fastify"

import { Tournament } from "../../services/tournament.js";
import { authenticate } from "../../services/authService.js";

export const tournamentListSock = async (app: FastifyInstance) => {
	const tournamentListConns = new Array<[string, WebSocket]>();

	app.get('/tournament-list', {websocket: true, preHandler: [authenticate] }, async (socket, req) => {
		let userId: string = req.user.id.toString();

		connectUser(userId, socket);
		console.custom('INFO', 'Users in tournament waiting room:', tournamentListConns.map(player => player[0]));

		sendTournamentList(tournamentListConns, app);

		socket.on('message', (messageBuffer: Event) => {
			handleMessage(messageBuffer, userId, socket);
		})

		socket.on('close', () => {
			handleClose(userId);
		})

		socket.on('error', (err: Event) => {
			console.custom('error', err);
			handleClose(userId);
		})
	});

	function handleMessage(messageBuffer: Event, userId: string, socket: WebSocket) {
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
	}

	function handleClose(userId: string) {
		const index = tournamentListConns.findIndex(([id]) => id === userId);
		if (index !== -1) {
			tournamentListConns.splice(index, 1);
			console.custom('INFO', `${userId} has left the tournament waiting room`);
		}
	}

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
	connections.forEach(([userId, socket]) => {
		let tournamentList = Array.from(app.tournaments.values()).map(tournament => ({
			id: tournament.id,
			maxPlayers: tournament.maxPlayers,
			playerCount: tournament.playerSockets.size,
			isRunning: tournament.isRunning,
			isUserInTournament: tournament.knownPlayers.has(userId) && !tournament.knownPlayers.get(userId)?.eliminated
		}));
		socket.send(JSON.stringify({
			type: 'tournamentList',
			tournaments: tournamentList,
		}));
		console.custom('INFO', `Sent tournament list to user ${userId}`);
	});
}
