const finalJeopardyClues = [
  { category: 'THIS IS JEOPARDY!', clue: 'On this late night host\'s list of 10 Things Communists Are No Damn Good At, #1 was "Guessing Final Jeopardy\\"', answer: 'David Letterman' },
  { category: '13-LETTER WORDS', clue: 'Word meaning "immeasurably small"; its first 8 letters are a word meaning "immeasurably great\\"', answer: 'infinitesimal' },
  { category: 'COMMON BONDS', clue: 'Peeling onions, watching Mel Gibson\'s film "Forever Young", missing Final Jeopardy!', answer: 'things that make you cry' },
  { category: 'JEOPARDY! 101', clue: "Including Final Jeopardy!, it's the total number of possible questions in one game", answer: '61' },
  { category: '\\"FI\\"', clue: 'It\'s the last "Jeopardy!" in the game', answer: 'Final Jeopardy' },
  { category: 'VIEWER MAIL', clue: 'Penitence was demanded when a Final Jeopardy! called Ash Wednesday this type of religious "day\\"', answer: 'Holy day' },
  { category: 'PEOPLE', clue: 'He said, "I... really never considered myself a TV star.  I always thought I was a neighbor who just came in for a visit\\"', answer: "Fred Rogers (of Mister Rogers' Neighborhood)" },
  { category: '19th CENTURY ART & HISTORY', clue: 'The red sky in Munch\'s "The Scream" may be from the debris in the Oslo air from this volcano half a world away', answer: 'Krakatoa' },
  { category: 'LITERARY INFLUENCES', clue: 'A 1919 Shaw play subtitled "A Fantasia in the Russian Manner..." is an homage to this playwright who died in 1904', answer: 'Anton Chekhov' },
  { category: 'SPANISH VERBS', clue: "Escribir means to do this; you'll have to do it during Final Jeopardy!", answer: 'to write' },
  { category: 'JEOPARDY PLATFORMS', clue: 'A train platform spells final jeopardy for this Tolstoy title heroine', answer: 'Anna Karenina' },
  { category: 'TRUE DAILY DOUBLES', clue: 'July 4, 1826: These 2 former presidents face final jeopardy', answer: 'Jefferson & John Adams' },
  { category: "HERE'S FINAL JEOPARDY", clue: "On April 21, 1910 reports of this author's death were not greatly exaggerated", answer: 'Mark Twain' },
  { category: "HERE'S FINAL JEOPARDY", clue: 'In London on August 13, 1910, it was good night, this nurse', answer: 'Florence Nightingale' },
  { category: "HERE'S FINAL JEOPARDY", clue: 'This 83-year-old revolutionary war hero took his last ride on May 10, 1818', answer: '(Paul) Revere' },
  { category: "HERE'S FINAL JEOPARDY", clue: "He's dead Jim; remember the Alamo & know this Kentuckian didn't make it out of the landmark on March 6, 1836", answer: 'James Bowie' },
  { category: "HERE'S FINAL JEOPARDY", clue: 'The last page of "The Autobiography of" this companion of Gertrude Stein was turned on March 7, 1967', answer: 'Alice B. Toklas' },
  { category: 'BRITISH NAMES', clue: "The last name of this 17th c. baronet who held many offices is synonymous with the govt. & especially the PM's residence", answer: '(Sir George) Downing' },
  { category: 'HISTORICAL GEOGRAPHY', clue: 'Most of the land fighting in the first Punic war between Rome & Carthage was on this island', answer: 'Sicily' },
  { category: 'FINAL JEOPARDY', clue: "Each side's lawyer makes this argument as a final statement to a jury", answer: 'closing' },
  { category: 'FINAL JEOPARDY', clue: 'This Belgian locale can mean a downfall, especially from the French perspective', answer: 'Waterloo' },
  { category: 'FINAL JEOPARDY', clue: 'This single-digit bankruptcy is also known as "liquidation bankruptcy\\"', answer: 'Chapter 7' },
  { category: 'FINAL JEOPARDY', clue: 'From the Latin for "nothing" comes this word meaning to reduce something to nothing', answer: 'annihilate' },
  { category: 'FINAL JEOPARDY', clue: 'This French word means the final resolution of the plot lines of a drama', answer: 'denouement' }
];
];


let currentAnswer = "";
let currentValue = 0;
let currentYear = "";
let currentIsDD = false;
let popupVisible = false;
let phase = 1;
let cluesUsed = 0;
let players = [];
let scores = [];

function startGame() {
  const count = parseInt(document.getElementById("player-count").value);
  players = Array.from({ length: count }, (_, i) => document.getElementById(`player-name-${i}`).value || `P${i + 1}`);
  scores = Array(count).fill(0);
  document.getElementById("player-setup").style.display = "none";
  document.getElementById("controls").style.display = "block";
  document.getElementById("round-select").style.display = "none";
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
  const round = phase === 2 ? "double" : "regular";
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
    document.getElementById("clue-count").textContent = cluesUsed;
    document.getElementById("phase-indicator").textContent = phase;
  } catch (err) {
    document.getElementById("loading").textContent = "Failed to load game. Please try again.";
    console.error(err);
  }
}

function showClue(q, cell) {
  if (popupVisible || cell.classList.contains("used")) return;
  popupVisible = true;
  currentAnswer = q.answer.replaceAll('\\"', '"');
  currentValue = q.value;
  currentYear = q.year || "";
  currentIsDD = q.daily_double;

  document.getElementById("clue").textContent = q.clue.replaceAll('\\"', '"');
  document.getElementById("answer").textContent = "";
  document.getElementById("special").textContent = currentIsDD ? "🎯 DAILY DOUBLE!" : "";
  document.getElementById("clue-value").textContent = `For $${currentValue}`;
  const showYear = document.getElementById("year-toggle").checked;
  document.getElementById("year-label").textContent = showYear && currentYear ? `📅 From ${currentYear}` : "";

  const sb = document.getElementById("score-buttons");
  sb.innerHTML = "";
  players.forEach((p, i) => {
    const group = document.createElement("div");
    group.className = "player-score-group player-" + i;

    const btnAdd = document.createElement("button");
    btnAdd.textContent = `+${currentValue} ${p}`;
    btnAdd.className = "score-button add";
  btnAdd.onclick = () => {

    scores[i] += currentValue;

    updateScoreboard();

    btnAdd.disabled = true;

    btnSub.disabled = true;

    if (players.length === 1) closePopup();

  };

    scores[i] += currentValue;
    updateScoreboard();
    if (players.length === 1) closePopup();
  };

    const btnSub = document.createElement("button");
    btnSub.textContent = `-${currentValue} ${p}`;
    btnSub.className = "score-button sub";
  btnSub.onclick = () => {

    scores[i] -= currentValue;

    updateScoreboard();

    btnAdd.disabled = true;

    btnSub.disabled = true;

    if (players.length === 1) closePopup();

  };

    scores[i] -= currentValue;
    updateScoreboard();
    if (players.length === 1) closePopup();
  };

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
  cluesUsed++;
  if (cluesUsed === 30 && phase === 2) finalJeopardy();
  document.getElementById("clue-count").textContent = cluesUsed;
  if (cluesUsed >= 30 && phase === 1) {
    setTimeout(() => {
      alert("Now entering Double Jeopardy!");
      phase = 2;
      cluesUsed = 0;
      document.getElementById("phase-indicator").textContent = phase;
      document.getElementById("clue-count").textContent = cluesUsed;
      loadGame();
    }, 300);
  }
}

function toggleTVMode() {
  const isTV = document.getElementById("tv-toggle").checked;
  document.body.classList.toggle("tv-mode", isTV);
}

window.onload = () => {
  document.getElementById("loading").style.display = "none";
  document.getElementById("year-toggle").addEventListener("change", () => {
    if (window.boardData) {
      const headers = document.querySelectorAll("table tr:first-child th");
      const showYear = document.getElementById("year-toggle").checked;
      const categories = Object.keys(window.boardData);
      headers.forEach((th, i) => {
        const cat = categories[i];
        const year = showYear && window.boardData[cat][0].year ? ` (${window.boardData[cat][0].year})` : "";
        th.textContent = cat + year;
      });
    }
  });

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
};

function finalJeopardy() {

  const clueObj = finalJeopardyClues[Math.floor(Math.random() * finalJeopardyClues.length)];

  const clue = clueObj.clue;

  const correctAnswer = clueObj.answer;

  const wagers = [];

  const answers = [];

  players.forEach((p, i) => {

    let maxWager = scores[i];

    let wagerPrompt = p + ", enter your Final Jeopardy wager (max " + maxWager + "):";

    let wager = parseInt(prompt(wagerPrompt, Math.min(1000, maxWager)));

    if (isNaN(wager) || wager < 0 || wager > maxWager) wager = 0;

    wagers.push(wager);

    let answerPrompt = p + ", enter your Final Jeopardy answer:";

    let answer = prompt(answerPrompt);

    answers.push(answer);

  });

  let summary = "Final Jeopardy\nClue: " + clue + "\nCorrect Answer: " + correctAnswer + "\n\n";

  players.forEach((p, i) => {

    let isCorrect = answers[i].trim().toLowerCase() === correctAnswer.toLowerCase();

    scores[i] += isCorrect ? wagers[i] : -wagers[i];

    summary += p + " wagered " + wagers[i] + ", answered '" + answers[i] + "', and was " + (isCorrect ? "correct" : "incorrect") + ".\n";

  });

  updateScoreboard();

  alert(summary);

  const winnerIndex = scores.indexOf(Math.max(...scores));

  alert("🏆 " + players[winnerIndex] + " wins with " + scores[winnerIndex] + " points!");

}

  let summary = "Final Jeopardy\nClue: " + clue + "\nCorrect Answer: " + correctAnswer + "\n\n";
  players.forEach((p, i) => {
    let isCorrect = answers[i].trim().toLowerCase() === correctAnswer.toLowerCase();
    scores[i] += isCorrect ? wagers[i] : -wagers[i];
    summary += p + " wagered " + wagers[i] + ", answered '" + answers[i] + "', and was " + (isCorrect ? "correct" : "incorrect") + ".\n";
  });
  updateScoreboard();
  alert(summary);
  const winnerIndex = scores.indexOf(Math.max(...scores));
  alert("🏆 " + players[winnerIndex] + " wins with " + scores[winnerIndex] + " points!");
}

document.addEventListener("DOMContentLoaded", () => {
  const finalBtn = document.getElementById("final-btn");
  if (finalBtn) finalBtn.addEventListener("click", finalJeopardy);
});

document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") closePopup();
    const popup = document.getElementById("popup");
    if (popup) popup.style.display = "none";
});

