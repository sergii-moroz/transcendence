interface BallState {
	x: number;
	y: number;
	dx: number;
	dy: number;
}

interface PredictionResult {
	predictedY: number;
	timeToReach: number;
	willHit: boolean;
}

class AIBallPredictor {
	private static readonly FIELD_Y = 150;
	private static readonly PADDLE_X = 240; // AI paddle X position (adjust based on your game)

	/**
	 * Predicts where the ball will be when it reaches the AI paddle
	 */
	static predictBallHit(ball: BallState): PredictionResult {
		// If ball is moving away from AI paddle, no hit prediction needed
		if (ball.dx <= 0) {
			return { predictedY: ball.y, timeToReach: Infinity, willHit: false };
		}

		// Calculate time for ball to reach paddle X position
		const timeToReach = (this.PADDLE_X - ball.x) / ball.dx;

		// Simulate ball movement with wall bounces
		let futureY = ball.y;
		let futureDy = ball.dy;
		let remainingTime = timeToReach;

		// Simulate bounces until we reach the target time
		while (remainingTime > 0) {
			// Calculate time to next wall collision
			let timeToWall: number;
			if (futureDy > 0) {
				timeToWall = (this.FIELD_Y - futureY) / futureDy;
			} else if (futureDy < 0) {
				timeToWall = (-this.FIELD_Y - futureY) / futureDy;
			} else {
				// Ball not moving vertically
				break;
			}

			if (timeToWall >= remainingTime) {
				// Ball reaches paddle before hitting wall
				futureY += futureDy * remainingTime;
				break;
			} else {
				// Ball hits wall first, then bounces
				futureY += futureDy * timeToWall;
				futureDy = -futureDy; // Bounce
				remainingTime -= timeToWall;
			}
		}

		return {
			predictedY: futureY,
			timeToReach,
			willHit: true
		};
	}

	/**
	 * Calculates optimal paddle position with some randomness for difficulty adjustment
	 */
	static calculateOptimalPaddleY(
		prediction: PredictionResult, 
		currentPaddleY: number,
		difficulty: 'easy' | 'medium' | 'hard' = 'medium'
	): number {
		if (!prediction.willHit) {
			return currentPaddleY; // Don't move if ball won't hit
		}

		// Add some error based on difficulty
		let errorMargin = 0;
		switch (difficulty) {
			case 'easy':
				errorMargin = 30;
				break;
			case 'medium':
				errorMargin = 15;
				break;
			case 'hard':
				errorMargin = 5;
				break;
		}

		// Add random error to make AI less perfect
		const randomError = (Math.random() - 0.5) * errorMargin;
		const targetY = prediction.predictedY + randomError;

		// Clamp to paddle movement bounds
		const MIN_Y = -150 + 30;
		const MAX_Y = 150 - 30;
		
		return Math.max(MIN_Y, Math.min(MAX_Y, targetY));
	}
}

// AI state to track target position and last update time
let aiTargetY = 0;
let lastPredictionUpdate = 0;

export function resetAIState() {
	aiTargetY = 0;
	lastPredictionUpdate = 0;
}

export function aiOpponent(paddle: any, frameCounter: number, ball: any) {
	const AI_SPEED = 3; // Reduced speed for smoother movement
	const PREDICTION_UPDATE_INTERVAL = 62; // Update prediction every 62 frames (roughly 1 second at 60fps)

	const MIN_Y = -150 + 30;
	const MAX_Y = 150 - 30;

	// Update AI prediction periodically (once per second)
	if (lastPredictionUpdate === 0 || frameCounter - lastPredictionUpdate >= PREDICTION_UPDATE_INTERVAL) {
		const prediction = AIBallPredictor.predictBallHit(ball);
		aiTargetY = AIBallPredictor.calculateOptimalPaddleY(
			prediction,
			paddle.y,
			'medium' // Adjust difficulty as needed
		);
		lastPredictionUpdate = frameCounter;
	}

	// Smoothly move AI paddle toward target position every frame
	const diff = aiTargetY - paddle.y;
	
	if (Math.abs(diff) > AI_SPEED) {
		// Move toward target
		paddle.y += Math.sign(diff) * AI_SPEED;
	} else {
		// Close enough, set exact position
		paddle.y = aiTargetY;
	}

	// Ensure paddle stays within bounds
	paddle.y = Math.max(MIN_Y, Math.min(MAX_Y, paddle.y));
}
