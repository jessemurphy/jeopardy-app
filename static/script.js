let currentAnswer = "";
let currentValue = 0;
let currentIsDD = false;
let score = 0;

async function loadGame() {
  document.getElementById("loading").style.display = "block";
  const round = document.getElementById("round-select").value;
  const res = await fetch(`/game?round=${round}`);
  const data = await res.json();
  window.boardData = data;

  const board = document.getElementById("board");
  board.innerHTML = '';

  const categories = Object.keys(data);
  const header = document.createElement("tr");
  categories.forEach(cat => {
    const th = document.createElement("th");
    th.textContent = cat;
    header.appendChild(th);
  });
  board.appendChild(header);

  for (let i = 0; i < 5; i++) {
    const row = document.createElement("tr");
    categories.forEach(cat => {
      const q = data[cat][i];
      const cell = document.createElement("td");
      cell.textContent = `$${q.value}`;
      cell.onclick = () => showClue(q, cell);
      row.appendChild(cell);
    });
    board.appendChild(row);
  }

  score = 0;
  updateScore();
  document.getElementById("loading").style.display = "none";
}

function showClue(q, cell) {
  if (cell.classList.contains("used")) return;
  document.getElementById("clue").textContent = q.clue;
  document.getElementById("answer").textContent = "";
  document.getElementById("special").textContent = q.daily_double ? "🎯 DAILY DOUBLE!" : "";
  document.getElementById("popup").style.display = "block";
  currentAnswer = q.answer;
  currentValue = q.value;
  currentIsDD = q.daily_double;
  cell.classList.add("used");
  cell.textContent = "";
  cell.onclick = null;
}

function revealAnswer() {
  document.getElementById("answer").textContent = currentAnswer;
}

function adjustScore(correct) {
  if (correct) score += currentValue;
  else score -= currentValue;
  updateScore();
}

function updateScore() {
  document.getElementById("score").textContent = score;
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}
window.onload = loadGame;