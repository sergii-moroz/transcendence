import {
	FastifyInstance,
	FastifyRequest
} from "fastify"
import { Tournament } from "../../services/tournament.js";
import { authenticate } from "../../services/authService.js";

export const tournamentRoomSock = async (app: FastifyInstance) => {

	app.get('/tournament/:tournamentId', { websocket: true, preHandler: [authenticate]}, (socket, req: FastifyRequest) => {
		console.custom("INFO",`New WebSocket connection from ${req.user.id}`);
		const userId = req.user.id.toString();
		const userName = req.user.username;
		const { tournamentId } = req.params as { tournamentId: string };
		const tournament = app.tournaments.get(tournamentId) as Tournament;

		// console.custom("WARN", `name: ${userName}, id: ${tournamentId}`);

		if (!tournament) {
			console.custom("WARN", 'User: ' + userName + ' tried to connect to a non-existing tournament: ' + tournamentId);
			socket.send(JSON.stringify({
				type: 'Error',
				message: 'Tournament not found'
			}));
			socket.close();
			return;
		}

		socket.on('message', (messageBuffer: Event) => {
			const message = JSON.parse(messageBuffer.toString());

			if(message.type === 'joinRoom') {
				if (tournament.deleteTimeout) {
					clearTimeout(tournament.deleteTimeout);
					tournament.deleteTimeout = null;
				}
				console.custom('INFO', `User: ${req.user.username} connected to tournament: ${tournamentId}`);
				tournament.addPlayer(socket, userId);
				socket.send(JSON.stringify({
					type: 'joinedRoom',
					message: `You have joined tournament room`
				}));
				console.custom('INFO', 'Users in tournament room:', tournament.players.map(player => player[0]));
			}
		});

		socket.on('close', () => {
			console.custom('INFO', `User: ${userName} disconnected from tournament room: ${tournamentId}`);
			if (tournament.players.some(([id]) => id === userId)) {
				tournament.players = tournament.players.filter(([id]) => id !== userId);
			}
			handleTimeout(tournament);
		})

		socket.on('error', (err: Event) => {
			console.custom('ERROR', 'WebSocket error:', err);
			handleTimeout(tournament);
		})
	});

	function handleTimeout(tournament: Tournament) {
		if (!tournament.deleteTimeout) {
			tournament.deleteTimeout = setTimeout(() => {
				if (tournament.players.length === 0 && tournament.activeGames === 0) {
					app.tournaments.delete(tournament.id);
					console.custom('INFO', `Tournament room ${tournament.id} closed due to inactivity`);
				}
				tournament.deleteTimeout = null;
			}, 10000);
		}
	}
}
