import {
	FastifyInstance,
	FastifyPluginOptions,
	FastifyRequest
} from "fastify"
import { TournamentRoomRequest } from "../../types/tournament.js";
import { Tournament } from "../../services/tournament.js";

export const tournamentRoomSock = async (app: FastifyInstance) => {

    app.get('/tournament/:tournamentId', { websocket: true }, (socket, req: TournamentRoomRequest) => {
		console.log(`New WebSocket connection from ${req.user.id}`);
		const userId = req.user.id.toString();
		const userName = req.user.username;
		const tournamentId = req.params.tournamentId;
		const tournament = app.tournaments.get(tournamentId) as Tournament;

		if (!tournament) {
			console.custom("WARN", 'User: ' + userName + ' tried to connect to a non-existing tournament: ' + tournamentId);
			socket.close();
			return;
		}

		socket.on('message', (messageBuffer: Event) => {
			const message = JSON.parse(messageBuffer.toString());
			
			if(message.type === 'joinRoom') {
				console.custom('INFO', `User: ${req.user.username} connected to tournament: ${tournamentId}`);
				console.custom('INFO', 'Users in tournament room:', tournament.players.map(player => player[0]));
				socket.send(JSON.stringify({
					type: 'joinedRoom',
					message: `You have joined tournament room`
				}));
				tournament.addPlayer(socket, userId);
			}
		});

		socket.on('close', () => {
			console.custom('INFO', `User: ${userName} disconnected from tournament room: ${tournamentId}`);
		})

		socket.on('error', (err: Event) => {
			console.custom('ERROR', 'WebSocket error:', err);
		})
	});
}