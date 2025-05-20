let currentAnswer = "";
let currentValue = 0;
let currentYear = "";
let currentIsDD = false;
let popupVisible = false;
let players = [];
let scores = [];

function startGame() {
  const count = parseInt(document.getElementById("player-count").value);
  players = Array.from({ length: count }, (_, i) => document.getElementById(`player-name-${i}`).value || `P${i + 1}`);
  scores = Array(count).fill(0);
  document.getElementById("player-setup").style.display = "none";
  document.getElementById("controls").style.display = "block";
  updateScoreboard();
  loadGame();
}

function updateScoreboard() {
  const sb = document.getElementById("scoreboard");
  sb.innerHTML = "";
  players.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "player-row";
    div.textContent = `${p}: $${scores[i]}`;
    sb.appendChild(div);
  });
}

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
      const showYear = document.getElementById("year-toggle").checked;
      const year = showYear && data[cat][0].year ? ` (${data[cat][0].year})` : "";
      th.textContent = cat + year;
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

    document.getElementById("loading").style.display = "none";
  } catch (err) {
    document.getElementById("loading").textContent = "Failed to load game. Please try again.";
    console.error(err);
  }
}

function updateCategoryHeadersWithYear(data) {
  const headers = document.querySelectorAll("table tr:first-child th");
  const showYear = document.getElementById("year-toggle").checked;
  const categories = Object.keys(data);

  headers.forEach((th, i) => {
    const cat = categories[i];
    const year = showYear && data[cat][0].year ? ` (${data[cat][0].year})` : "";
    th.textContent = cat + year;
  });
}

function showClue(q, cell) {
  if (popupVisible || cell.classList.contains("used")) return;
  popupVisible = true;
  currentAnswer = q.answer;
  currentValue = q.value;
  currentYear = q.year || "";
  currentIsDD = q.daily_double;

  document.getElementById("clue").textContent = q.clue;
  document.getElementById("answer").textContent = "";
  document.getElementById("special").textContent = currentIsDD ? "🎯 DAILY DOUBLE!" : "";
  document.getElementById("clue-value").textContent = `For $${currentValue}`;
  document.getElementById("year-label").textContent = "";

  const sb = document.getElementById("score-buttons");
  sb.innerHTML = "";
  players.forEach((p, i) => {
    const group = document.createElement("div");
    group.className = "player-score-group player-" + i;

    const btnAdd = document.createElement("button");
    btnAdd.textContent = `+${currentValue} ${p}`;
    btnAdd.className = "score-button add";
    btnAdd.onclick = () => { scores[i] += currentValue; updateScoreboard(); closePopup(); };

    const btnSub = document.createElement("button");
    btnSub.textContent = `-${currentValue} ${p}`;
    btnSub.className = "score-button sub";
    btnSub.onclick = () => { scores[i] -= currentValue; updateScoreboard(); closePopup(); };

    group.appendChild(btnAdd);
    group.appendChild(btnSub);
    sb.appendChild(group);
  });

  document.getElementById("popup").style.display = "block";
  cell.classList.add("used");
  cell.textContent = "";
  cell.onclick = null;
}

function revealAnswer() {
  document.getElementById("answer").textContent = currentAnswer;
}

function closePopup() {
  popupVisible = false;
  document.getElementById("popup").style.display = "none";
}

function toggleTVMode() {
  const isTV = document.getElementById("tv-toggle").checked;
  document.body.classList.toggle("tv-mode", isTV);
}

window.onload = () => {
document.getElementById("player-count").addEventListener("change", () => {
  const count = parseInt(document.getElementById("player-count").value);
  const setup = document.getElementById("player-setup");
  let inputs = document.getElementById("name-inputs");
  if (!inputs) {
    inputs = document.createElement("div");
    inputs.id = "name-inputs";
    setup.appendChild(inputs);
  }
  inputs.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const label = document.createElement("label");
    label.textContent = `Player ${i + 1}: `;
    const input = document.createElement("input");
    input.type = "text";
    input.id = `player-name-${i}`;
    input.placeholder = `P${i + 1}`;
    input.style.margin = "5px";
    inputs.appendChild(label);
    inputs.appendChild(input);
    inputs.appendChild(document.createElement("br"));
  }
});
  document.getElementById("loading").style.display = "none";
  document.getElementById("year-toggle").addEventListener("change", () => {
    if (window.boardData) {
      updateCategoryHeadersWithYear(window.boardData);
    }
  });
};