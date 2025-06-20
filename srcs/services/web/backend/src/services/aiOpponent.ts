export function aiOpponent(state: any, frameCounter: number, ball: any) {
	const AI_SPEED = 15;
	const paddle = state.paddles.player2;

	if (frameCounter % 15 === 0) {
		if (ball.dx > 0) {
			// Move paddle towards ball
			if (ball.y < paddle.y) {
				paddle.y -= AI_SPEED;
			} else {
				paddle.y += AI_SPEED;
			}
		}
	}
}
