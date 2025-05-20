let currentAnswer = "";
let currentValue = 0;
let currentIsDD = false;
let currentYear = "";
let score = 0;
let popupVisible = false;

async function loadGame() {
  if (popupVisible) return;
  document.getElementById("loading").style.display = "block";
  const round = document.getElementById("round-select").value;
  try {
    const res = await fetch(`/game?round=${round}`);
    if (!res.ok) throw new Error("Failed to load questions.");
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
  } catch (err) {
    document.getElementById("loading").textContent = "Failed to load game. Please try again.";
    console.error(err);
  }
}

function showClue(q, cell) {
  if (popupVisible || cell.classList.contains("used")) return;
  popupVisible = true;
  document.getElementById("clue").textContent = q.clue;
  document.getElementById("answer").textContent = "";
  document.getElementById("special").textContent = q.daily_double ? "🎯 DAILY DOUBLE!" : "";
  document.getElementById("clue-value").textContent = `For $${q.value}`;
  currentAnswer = q.answer;
  currentValue = q.value;
  currentIsDD = q.daily_double;
  currentYear = q.year || "";
  const showYear = document.getElementById("year-toggle").checked;
  document.getElementById("year-label").textContent = showYear && currentYear ? `📅 From ${currentYear}` : "";
  document.getElementById("popup").style.display = "block";
  cell.classList.add("used");
  cell.textContent = "";
  cell.onclick = null;
}

function revealAnswer() {
  document.getElementById("answer").textContent = currentAnswer;
}

function adjustScore(correct) {
  score += correct ? currentValue : -currentValue;
  updateScore();
}

function updateScore() {
  document.getElementById("score").textContent = score;
}

function closePopup() {
  popupVisible = false;
  document.getElementById("popup").style.display = "none";
}

function toggleTVMode() {
  const isTV = document.getElementById("tv-toggle").checked;
  document.body.classList.toggle("tv-mode", isTV);
}

window.onload = loadGame;