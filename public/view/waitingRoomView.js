export const renderWaitingRoom = (customRoomName) => (
	`
	<h2>Waiting for other players...</h2>
	<p>Room ID: ${customRoomName}</p>
	<p id="waiting-message">Waiting for other players to join...</p>
	<a href="/home" id="home-link">Home</button>
	`
)