# Overall Structure of matchmaking/games
> make changes / add additional ideas


## **1. Databases**

### **Users**

structure per user:

- `User ID`
- `Username`
- `password`
- `Games Played`
- `Games Won`

### **Waiting-Players**

- Stores: `Player ID` (waiting in matchmaking)
- **in-memory structure** is probably better (DB is overkill)

### **Active Games**

- Structure per room/game
  - `room ID`
  - `Player 1 ID`
  - `Player 2 ID`
  - `BallX`, `BallY`
  - `BallDirX`, `BallDirY`
  - `Ball Speed`
  - `Points Player 1`
  - `Points Player 2`
  - `Game State` (`playing`, `finished`, `terminated`)

---

## **2. Logic Server**

### **1. Handling Matchmaking via normal endpoint (on e.g. /api/matchmaking)**

- gets client request
  - **If `Waiting-Players` is empty**:
    - Add user to `Waiting-Players` by extracting userID from request
    - Respond: `state: waiting`
  - **If someone is waiting**:
    - Create new room in `Active Games` DB
    - Remove player from `Waiting-Players`
    - Add both players this new room
    - Respond to both clients:
      - `{ state: match found,` `roomID: 123,` `opponent: username }`

### **2. Game Loop Logic**

- Set up **WebSocket listener** per room/game, that listen on: `game/roomID`
- **Handle client requests of type: `{move: up}`:**
  - validate input (will new paddle pos be still in bounds)
  - extract userID from request
  - Update game state in DB
- **Fixed interval loop:**
  - update ball position/direction
  - Check if ball passed paddle
    - If so: update points(score) in DB
  - Check for win condition (max points was reached):
    - If met:
		- send to clients: `{ state: finished},` `score: {userID 1: 3, userID 2: 5},` `winner: userID 2 }`
		- update games played/games won in `users` DB for each player
		- delete room, websocket listener
    - If not:
		- send to clients: `{ state: playing},` `Ball: {x: 3, y: 5},` `paddles: {userID 1: 60, userID 2: 40},` `score: {userID 1: 1, userID 2: 2}`
  - Check if either player disconnected:
    - If yes: 
		- send to clients: `state: terminated`
		- delete room, websocket listener
---

## **3. Logic Client**

### **1. Initial Request**

- Send API request to server
  - If response = `waiting`:
    - Show waiting animation
  - If response = `match found`:
    - switch to game view
    - Setup WebSocket to `/game/roomID` (roomID from response)
> how to get second response after first was `waiting`?

### **2. WebSocket Behavior**

- On button press (e.g., paddle move up):
  - Send message (`move: up`)
- Listen for game state updates:
  - `state: playing`: render game
  - `state: finished`: switch to result view
  - `state: terminated`: switch to failure view


### Problems:
