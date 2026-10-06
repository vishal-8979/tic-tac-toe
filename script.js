const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("reset-btn");
const difficultyEl = document.getElementById("difficulty");
const modeBtns = Array.from(document.querySelectorAll(".mode-btn"));
const cells = Array.from(document.querySelectorAll(".cell"));

const WIN_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const HUMAN = "X";
const AI = "O";

let board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;
let aiThinking = false;
let mode = "pvp";
const scores = { X: 0, O: 0, draw: 0 };

function winComboFor(b, player) {
  return WIN_COMBOS.find((combo) => combo.every((i) => b[i] === player));
}

function turnText() {
  if (mode === "ai") {
    return currentPlayer === HUMAN ? "Your turn" : "AI is thinking...";
  }
  return `Player ${currentPlayer}'s turn`;
}

function applyMove(index) {
  board[index] = currentPlayer;
  cells[index].textContent = currentPlayer;
  cells[index].classList.add(currentPlayer.toLowerCase());

  const winCombo = winComboFor(board, currentPlayer);
  if (winCombo) {
    statusEl.textContent =
      mode === "ai"
        ? currentPlayer === HUMAN
          ? "You win!"
          : "AI wins!"
        : `Player ${currentPlayer} wins!`;
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
  statusEl.textContent = turnText();

  if (mode === "ai" && currentPlayer === AI && !gameOver) {
    aiThinking = true;
    setTimeout(() => {
      aiThinking = false;
      makeAiMove();
    }, 400);
  }
}

function handleCellClick(e) {
  const index = e.target.dataset.index;
  if (!index || gameOver || aiThinking || board[index] !== "") return;
  if (mode === "ai" && currentPlayer !== HUMAN) return;
  applyMove(index);
}

function availableMoves(b) {
  return b.reduce((acc, v, i) => (v === "" ? (acc.push(i), acc) : acc), []);
}

function minimax(b, depth, isMaximizing) {
  if (winComboFor(b, AI)) return 10 - depth;
  if (winComboFor(b, HUMAN)) return depth - 10;
  const moves = availableMoves(b);
  if (moves.length === 0) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (const i of moves) {
      b[i] = AI;
      best = Math.max(best, minimax(b, depth + 1, false));
      b[i] = "";
    }
    return best;
  }
  let best = Infinity;
  for (const i of moves) {
    b[i] = HUMAN;
    best = Math.min(best, minimax(b, depth + 1, true));
    b[i] = "";
  }
  return best;
}

function bestMoveMinimax() {
  let bestScore = -Infinity;
  let bestMoves = [];
  for (const i of availableMoves(board)) {
    board[i] = AI;
    const score = minimax(board, 0, false);
    board[i] = "";
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [i];
    } else if (score === bestScore) {
      bestMoves.push(i);
    }
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function findTacticalMove(player) {
  for (const i of availableMoves(board)) {
    board[i] = player;
    const wins = !!winComboFor(board, player);
    board[i] = "";
    if (wins) return i;
  }
  return null;
}

function chooseAiMove() {
  const moves = availableMoves(board);
  const difficulty = difficultyEl.value;

  if (difficulty === "easy") {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  if (difficulty === "medium") {
    const win = findTacticalMove(AI);
    if (win !== null) return win;
    const block = findTacticalMove(HUMAN);
    if (block !== null) return block;
    if (board[4] === "") return 4;
    const corners = [0, 2, 6, 8].filter((i) => board[i] === "");
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
    return moves[Math.floor(Math.random() * moves.length)];
  }

  return bestMoveMinimax();
}

function makeAiMove() {
  if (gameOver || mode !== "ai" || currentPlayer !== AI) return;
  applyMove(chooseAiMove());
}

function updateScores() {
  document.getElementById("score-x").textContent = scores.X;
  document.getElementById("score-o").textContent = scores.O;
  document.getElementById("score-draw").textContent = scores.draw;
}

function updateLabels() {
  document.getElementById("label-x").textContent = mode === "ai" ? "You" : "X";
  document.getElementById("label-o").textContent = mode === "ai" ? "AI" : "O";
}

function resetGame() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameOver = false;
  aiThinking = false;
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("x", "o", "winner");
  });
  statusEl.textContent = turnText();
}

function setMode(newMode) {
  mode = newMode;
  modeBtns.forEach((btn) => btn.classList.toggle("active", btn.dataset.mode === mode));
  difficultyEl.classList.toggle("hidden", mode !== "ai");
  scores.X = 0;
  scores.O = 0;
  scores.draw = 0;
  updateScores();
  updateLabels();
  resetGame();
}

cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
resetBtn.addEventListener("click", resetGame);
modeBtns.forEach((btn) => btn.addEventListener("click", () => setMode(btn.dataset.mode)));
difficultyEl.addEventListener("change", resetGame);

updateLabels();
