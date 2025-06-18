import { Router } from "../router-static.js"
import { GameState } from "../types.js"

export class SingleplayerGame extends HTMLElement {
    canvas!: HTMLCanvasElement;
    ctx!: CanvasRenderingContext2D;
    gameState: GameState;
    gameRunning: boolean = false;
    gameOver: boolean = false;
    gameOverMessage: string | null = null;
    winner: string | null = null;
    playerScore: number = 0;
    aiScore: number = 0;
    keys: Set<string> = new Set();
    
    // AI restriction variables
    aiLastBallRead: number = 0;
    aiKnownBallPosition: { x: number, y: number } | null = null;
    AI_READ_INTERVAL: number = 1000; // 1 second in milliseconds

    constructor() {
        super();
        this.gameState = {
            ball: { x: 0, y: 0, dx: 4, dy: 4 },
            paddles: {
                player1: { y: 0 },
                player2: { y: 0 }
            },
            scores: { player1: 0, player2: 0, user1: 'You', user2: 'AI' }
        };
    }

    connectedCallback() {
        this.render();
        this.canvas = document.getElementById("singleplayer-game") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.handleCanvasScaling();
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('resize', this.handleCanvasScaling);
        this.startGame();
        this.renderLoop();
    }

    disconnectedCallback() {
        this.gameRunning = false;
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('resize', this.handleCanvasScaling);
    }

    render = () => {
        this.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center;">
            <h2>Singleplayer Ping Pong</h2>
            <div style="margin: 10px 0;">
                <button id="start-game" class="tw-btn">Start Game</button>
                <button id="back-home" class="tw-btn">Back to Home</button>
            </div>
            <canvas id="singleplayer-game"></canvas>
        </div>
        `;

        // Add event listeners for buttons
        setTimeout(() => {
            document.getElementById('start-game')?.addEventListener('click', () => {
                this.resetGame();
                this.startGame();
            });
            document.getElementById('back-home')?.addEventListener('click', () => {
                Router.navigateTo('/home');
            });
        }, 0);
    }

    handleKeyDown = (e: KeyboardEvent) => {
        if (this.gameOver) return;
        this.keys.add(e.key);
    }

    handleKeyUp = (e: KeyboardEvent) => {
        this.keys.delete(e.key);
    }

    handlePlayerInput = () => {
        if (!this.gameRunning || this.gameOver) return;

        const STEP = 20;
        const MIN_Y = -150 + 30;
        const MAX_Y = 150 - 30;

        if (this.keys.has('ArrowUp') && this.gameState.paddles.player1.y > MIN_Y) {
            this.gameState.paddles.player1.y -= STEP;
        }
        if (this.keys.has('ArrowDown') && this.gameState.paddles.player1.y < MAX_Y) {
            this.gameState.paddles.player1.y += STEP;
        }
    }

    updateAI = () => {
        if (!this.gameRunning || this.gameOver) return;

        const currentTime = Date.now();
        
        // AI can only read ball position once per second
        if (currentTime - this.aiLastBallRead >= this.AI_READ_INTERVAL) {
            this.aiKnownBallPosition = {
                x: this.gameState.ball.x,
                y: this.gameState.ball.y
            };
            this.aiLastBallRead = currentTime;
        }

        // AI moves based on last known ball position
        if (this.aiKnownBallPosition) {
            const aiPaddle = this.gameState.paddles.player2;
            const STEP = 15; // AI moves slightly slower than player
            const MIN_Y = -150 + 30;
            const MAX_Y = 150 - 30;

            // Simple AI: move towards last known ball position
            const targetY = this.aiKnownBallPosition.y;
            const diff = targetY - aiPaddle.y;
            
            if (Math.abs(diff) > 5) { // Add some tolerance to prevent jittering
                if (diff > 0 && aiPaddle.y < MAX_Y) {
                    aiPaddle.y += STEP;
                } else if (diff < 0 && aiPaddle.y > MIN_Y) {
                    aiPaddle.y -= STEP;
                }
            }
        }
    }

    startGame = () => {
        this.gameRunning = true;
        this.gameLoop();
    }

    resetGame = () => {
        this.gameRunning = false;
        this.gameOver = false;
        this.gameOverMessage = null;
        this.winner = null;
        // Reset AI variables
        this.aiLastBallRead = 0;
        this.aiKnownBallPosition = null;
        this.gameState = {
            ball: { x: 0, y: 0, dx: 4, dy: 4 },
            paddles: {
                player1: { y: 0 },
                player2: { y: 0 }
            },
            scores: { player1: 0, player2: 0, user1: 'You', user2: 'AI' }
        };
    }

    gameLoop = () => {
        const interval = setInterval(() => {
            if (!this.gameRunning) {
                clearInterval(interval);
                return;
            }

            this.handlePlayerInput();
            this.updateAI();
            this.updateBall();
            this.checkScores();
        }, 16); // ~60 FPS
    }

    updateBall = () => {
        const FIELD_X = 250, FIELD_Y = 150;
        const PADDLE_X1 = -FIELD_X + 10, PADDLE_X2 = FIELD_X - 10;
        const PADDLE_HEIGHT = 30;

        this.gameState.ball.x += this.gameState.ball.dx;
        this.gameState.ball.y += this.gameState.ball.dy;

        // Ball collision with paddles
        if (
            this.gameState.ball.x <= PADDLE_X1 &&
            Math.abs(this.gameState.ball.y - this.gameState.paddles.player1.y) < PADDLE_HEIGHT
        ) {
            this.gameState.ball.dx *= -1;
            this.gameState.ball.dx *= 1.05;
            this.gameState.ball.dy *= 1.05;
        } else if (
            this.gameState.ball.x >= PADDLE_X2 &&
            Math.abs(this.gameState.ball.y - this.gameState.paddles.player2.y) < PADDLE_HEIGHT
        ) {
            this.gameState.ball.dx *= -1;
            this.gameState.ball.dx *= 1.05;
            this.gameState.ball.dy *= 1.05;
        }

        // Ball collision with walls
        if (this.gameState.ball.y <= -FIELD_Y || this.gameState.ball.y >= FIELD_Y) {
            this.gameState.ball.dy *= -1;
        }

        // Scoring
        if (this.gameState.ball.x <= -FIELD_X + 5) {
            this.gameState.scores.player2++;
            this.resetBall(false); // AI scored
        }
        if (this.gameState.ball.x >= FIELD_X - 5) {
            this.gameState.scores.player1++;
            this.resetBall(true); // Player scored
        }
    }

    resetBall = (playerScored: boolean) => {
        const FIELD_X = 250;
        const PADDLE_X1 = -FIELD_X + 10, PADDLE_X2 = FIELD_X - 10;

        this.gameState.ball.dx = 4;
        this.gameState.ball.dy = 4;
        
        if (playerScored) {
            this.gameState.ball.x = PADDLE_X2 - 10;
            this.gameState.ball.y = this.gameState.paddles.player2.y;
        } else {
            this.gameState.ball.x = PADDLE_X1 + 10;
            this.gameState.ball.y = this.gameState.paddles.player1.y;
        }
    }

    checkScores = () => {
        if (this.gameState.scores.player1 >= 7 || this.gameState.scores.player2 >= 7) {
            this.gameRunning = false;
            this.gameOver = true;

            if (this.gameState.scores.player1 >= 7) {
                this.winner = 'player1';
                this.gameOverMessage = 'You Win!';
            } else {
                this.winner = 'player2';
                this.gameOverMessage = 'AI Wins!';
            }

            // Save game result (similar to multiplayer)
            this.saveGameResult();

            // Auto-redirect after 3 seconds
            setTimeout(() => {
                Router.navigateTo('/home');
            }, 3000);
        }
    }

    saveGameResult = async () => {
        try {
            const gameResult = {
                gameMode: 'singleplayer',
                playerScore: this.gameState.scores.player1,
                aiScore: this.gameState.scores.player2,
                won: this.gameState.scores.player1 >= 7
            };

            // You can implement API call here to save singleplayer game results
            // Similar to how multiplayer games are saved in the database
            console.log('Saving singleplayer game result:', gameResult);
        } catch (error) {
            console.error('Failed to save game result:', error);
        }
    }

    renderLoop = () => {
        if (!this.gameOver) {
            this.drawGameState(this.gameState);
        } else {
            this.drawGameOver(this.gameOverMessage!, this.winner!);
        }
        requestAnimationFrame(this.renderLoop);
    }

    handleCanvasScaling = () => {
        const maxWidth = Math.min(window.innerWidth * 0.9, 1000);
        const maxHeight = Math.min(window.innerHeight * 0.9, 600);

        let width = maxWidth;
        let height = width * 3 / 5;

        if (height > maxHeight) {
            height = maxHeight;
            width = height * 5 / 3;
        }

        this.canvas.width = Math.round(width);
        this.canvas.height = Math.round(height);
    }

    logicalToCanvasX(x: number): number {
        return (x + 250) / 500 * this.canvas.width;
    }

    logicalToCanvasY(y: number): number {
        return (y + 150) / 300 * this.canvas.height;
    }

    // Reuse drawing methods from GameRoom component
    drawBall = (x: number, y: number, dx: number, dy: number) => {
        let radius = this.canvas.width / 100;

        const speed = Math.sqrt(dx * dx + dy * dy);
        const baseSpeed = 5;
        const maxSpeed = 10;

        const t = Math.min(1, (speed - baseSpeed) / (maxSpeed - baseSpeed));
        const saturation = t * 100;
        const lightness = 100 - t * 50;

        this.ctx.fillStyle = `hsl(0, ${saturation}%, ${lightness}%)`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0.0, 2.0 * Math.PI, false);
        this.ctx.closePath();
        this.ctx.fill();
    }

    clearField = (width: number, height: number) => {
        this.ctx.fillStyle = "#393f3f";
        this.ctx.fillRect(0, 0, width, height);
    }

    drawPaddle1 = (y: number) => {
        const w = this.canvas.width / 50;
        const h = this.canvas.height / 5;

        this.ctx.fillStyle = "#02a5f7";
        this.ctx.fillRect(0, y - 0.5 * h, w, h);
    }

    drawPaddle2 = (y: number) => {
        const w = this.canvas.width / 50;
        const h = this.canvas.height / 5;

        this.ctx.fillStyle = "#f7026a";
        this.ctx.fillRect(this.canvas.width - w, y - 0.5 * h, w, h);
    }

    drawScore = (pos_x: number, pos_y: number, score: number, username: string) => {
        this.ctx.fillStyle = "#bfbfbf";
        this.ctx.font = "30px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "top";
        
        this.ctx.fillText(score.toString(), pos_x, pos_y);
        this.ctx.font = "15px Arial";
        this.ctx.fillText(username, pos_x, pos_y + 30);
    }

    drawGameOver = (message: string, winner: string) => {
        if(winner == 'player1') {
            this.ctx.fillStyle = "#02a5f7";
        } else {
            this.ctx.fillStyle = "#f7026a";
        }
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = `bold ${this.canvas.width / 30}px Arial`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(message, (this.canvas.width / 2), this.canvas.height / 2);
        this.ctx.font = `${this.canvas.width / 50}px Arial`;
        this.ctx.fillText(`Redirecting in 3 seconds`, (this.canvas.width / 2), (this.canvas.height / 2) + 30);
    }

    drawGameState = (state: GameState) => {
        let score1_x = (this.canvas.width / 5);
        let score2_x = this.canvas.width - (this.canvas.width / 5);
        let score_y = (this.canvas.height / 3);

        this.clearField(this.canvas.width, this.canvas.height);
        this.drawScore(score1_x, score_y, state.scores.player1, state.scores.user1);
        this.drawScore(score2_x, score_y, state.scores.player2, state.scores.user2);
        this.drawPaddle1(this.logicalToCanvasY(state.paddles.player1.y));
        this.drawPaddle2(this.logicalToCanvasY(state.paddles.player2.y));
        this.drawBall(this.logicalToCanvasX(state.ball.x), this.logicalToCanvasY(state.ball.y), state.ball.dx, state.ball.dy);
    }
}

