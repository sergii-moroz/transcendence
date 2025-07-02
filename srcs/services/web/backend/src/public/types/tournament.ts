export type PlayerInfo = {
	id: string;
	name: string;
	score: number;
};

export type Matchup = {
	gameId: string;
	round: number;
	p1: PlayerInfo;
	p2: PlayerInfo;
	winnerId: string | null;
};