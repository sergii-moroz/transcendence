# transcendence

## How is the matchmaking gonna work?
 - A user navigates to the waiting room in SAP
 - As soon as the user loads the page they get connected to a waiting room i/o socket
 - On the server side we receive the client id and their website username
 - We put the data in an array(there can be a better solution for sure)
 - When at least 2 users connected we create a game session for them
 - Emit an event on socket while sending a var to redirect them to the game (redirect with 'navigate()' or smth simmilar)
 - Remove those users from the array on the server side
 - Repeat