var origBoard; // array to keep track of O's and X's in the cells (It's an array of numbers 0-9 which will be replaced by either O or X when someone clicks that square)
const huPlayer = 'O';
const aiPlayer = 'X';
const winCombos = [
  [0,1,2],
  [3,4,5],
  [6,7,8],
  [0,3,6],
  [1,4,7],
  [2,5,8],
  [0,4,8],
  [6,4,2]
]

const cells = document.querySelectorAll('.cell');

startGame();

function startGame() {
	document.querySelector(".endgame").style.display = 'none'; // every time startGame is called/replay is hit, display will become none
	origBoard = Array.from(Array(9).keys());
	//console.log(origBoard);
	for(var i = 0; i < cells.length; i++) {
		cells[i].innerText = '';
		cells[i].style.removeProperty('background-color');
		cells[i].addEventListener('click', turnClick, false); // false is the third parameter which indicates turnClick will be executed after other click events

	}

}

function turnClick(square) {
	if (typeof origBoard[square.target.id] == 'number') {
	turn(square.target.id, huPlayer); // calling turn function when human player clicks
	if (!checkTie()) { // if the game is not tied, ai player takes turn
		turn(bestSpot(), aiPlayer);
	}
}

}

function turn(squareId, player) {
	origBoard[squareId] = player; // marking player's cell in the array
	document.getElementById(squareId).innerText = player; // showing the marked place on the output
	let gameWon = checkWin(origBoard, player); // checking on every turn if game has been won by anyone
	if (gameWon) {
		gameOver(gameWon); // when gameWon != null
	}
}

function checkWin(board, player) {
	let plays = board.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []) // plays is all the places which have been played on. reduce method goes over board array and does something (a: accumulator, e: event, i: index). If the element is a player, we'll add that index to array, else, return array as it is.
	let gameWon = null; // loop through all possible winning combos and see if it's there in our board. index tells which row of winCombos array has player won at, win refers to every element of that particular row
	for (let [index, win] of winCombos.entries()) {
		if (win.every(elem => plays.indexOf(elem) > -1)) { // checking if the player has played in all of the winning parts of a particular combo (eg: 0,1,2 or 3,4,5).
			gameWon = {index: index, player: player}; // gameWon will have what was the winning index and which player won 
			break;
		}
	}
	return gameWon;
}

function gameOver(gameWon) {
	for (let index of winCombos[gameWon.index]) { // highlight the winning combo by going through every element of the the gameWon index row 
		document.getElementById(index).style.backgroundColor = (gameWon.player == huPlayer ? "#18FFFF" : "#EC407A");
	}
	for (var i = cells.length - 1; i >= 0; i--) { // removing the clicking feature after game is over
		cells[i].removeEventListener('click', turnClick, false);
	}
	declareWinner(gameWon.player == huPlayer ? "You win!" : "You lose :(");
}

function bestSpot() {
	//return emptySquares()[0]; // fills the first empty cell in the list
	return minimax(origBoard, aiPlayer).index; // index of the object move, which has score and index property, obtained from minimax function

}

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// A recursive function which helps the computer play most effectively(https://medium.freecodecamp.org/how-to-make-your-tic-tac-toe-game-unbeatable-by-using-the-minimax-algorithm-9d690bad4b37)
function minimax(newBoard, player) {

var availSpots = emptySquares(newBoard);

	// Base Case (returning score at terminal positions)
	if (checkWin(newBoard, huPlayer)) {return {score: -10};} // hu wins
	else if(checkWin(newBoard, aiPlayer)) {return {score: 10};} // ai wins
	else if(availSpots.length === 0) {return {score: 0};} // tie

	// Recursive Step (collecting scores from empty spots to evaluate later)
	var moves = []; // array of all moves' score and index
	for (var i = availSpots.length - 1; i >= 0; i--) {
		var move = {};
		move.index = newBoard[availSpots[i]];
		newBoard[availSpots[i]] = player; // set the empty spot to the current player
    
    /*collect the score resulted from calling minimax 
      on the opponent of the current player*/
		if (player == huPlayer) {
			var result = minimax(newBoard, aiPlayer);
			move.score = result.score;
		} else {
			var result = minimax(newBoard, huPlayer);
			move.score = result.score;
		}

		// reset the spot to empty
           newBoard[availSpots[i]] = move.index;

     // push the object to the array
           moves.push(move);
   }

   // Small Calculation (choosing highest score move when ai plays and lowest when human plays)
   var bestMove;
   if (player == aiPlayer) {
   	let bestScore = -1000;
   	for (var i = moves.length - 1; i >= 0; i--) {
   		if (moves[i].score > bestScore) {
   			bestScore = moves[i].score;
   			bestMove = i;
   		}
   	}
   } else {
   	let bestScore = 1000;
   	for (var i = moves.length - 1; i >= 0; i--) {
   		if (moves[i].score < bestScore) {
   			bestScore = moves[i].score;
   			bestMove = i;
   		}
   	}
   }

   return moves[bestMove];	
}
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function emptySquares() {
	return origBoard.filter(s => typeof s == 'number'); // return the array of empty cells from origBoard
}

function checkTie() { 
	if (emptySquares().length == 0) {
		for (var i = cells.length - 1; i >= 0; i--) {
			cells[i].style.backgroundColor = "#CDDC39";
			cells[i].removeEventListener('click', turnClick, false);
		}
		declareWinner("Tie Game!");
		return true; // game is a tie
	}
	return false; // when game is not a tie
}

function declareWinner(who) {
	document.querySelector(".endgame").style.display = "block";
	document.querySelector(".endgame .text").innerText = who;
}