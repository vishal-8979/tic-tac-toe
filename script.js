const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("reset-btn");
const cells = Array.from(document.querySelectorAll(".cell"));

const WIN_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

let board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;
const scores = { X: 0, O: 0, draw: 0 };

function handleCellClick(e) {
  const index = e.target.dataset.index;
  if (!index || gameOver || board[index] !== "") return;

  board[index] = currentPlayer;
  e.target.textContent = currentPlayer;
  e.target.classList.add(currentPlayer.toLowerCase());

  const winCombo = getWinner(currentPlayer);
  if (winCombo) {
    statusEl.textContent = `Player ${currentPlayer} wins!`;
    winCombo.forEach((i) => cells[i].classList.add("winner"));
    scores[currentPlayer]++;
    updateScores();
    gameOver = true;
    return;
  }

  if (!board.includes("")) {
    statusEl.textContent = "It's a draw!";
    scores.draw++;
    updateScores();
    gameOver = true;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusEl.textContent = `Player ${currentPlayer}'s turn`;
}

function getWinner(player) {
  return WIN_COMBOS.find((combo) =>
    combo.every((i) => board[i] === player)
  );
}

function updateScores() {
  document.getElementById("score-x").textContent = scores.X;
  document.getElementById("score-o").textContent = scores.O;
  document.getElementById("score-draw").textContent = scores.draw;
}

function resetGame() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameOver = false;
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("x", "o", "winner");
  });
  statusEl.textContent = "Player X's turn";
}

cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
resetBtn.addEventListener("click", resetGame);
