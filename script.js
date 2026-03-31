let questions = [];
let currentQuestion = 0;
let score = 0;
let playerName = "";

async function loadQuestions() {
  const response = await fetch("questions.json");
  questions = await response.json();
}

function startGame() {
  playerName = document.getElementById("player-name").value;
  localStorage.setItem("playerName", playerName);
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("question-screen").classList.remove("hidden");
  showQuestion();
}

function showQuestion() {
  if (currentQuestion >= questions.length) {
    endGame();
    return;
  }

  const q = questions[currentQuestion];
  document.getElementById("dialogue").innerText = q.text;
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt.text;
    btn.onclick = () => {
      if (opt.correct) score += 10;
      if (opt.link) window.open(opt.link, "_blank");
      currentQuestion++;
      showQuestion();
    };
    optionsDiv.appendChild(btn);
  });
}

function endGame() {
  document.getElementById("question-screen").classList.add("hidden");
  document.getElementById("end-screen").classList.remove("hidden");

  let percentage = (score / (questions.length * 10)) * 100;
  let message = "";

  if (percentage <= 50) message = "Por poco mueres en una dimensión...";
  else if (percentage <= 70) message = "Has sobrevivido, pero con dificultad...";
  else if (percentage <= 90) message = "Eres un gran influencer...";
  else message = "¡Eres nuestro influencer más importante!";

  document.getElementById("final-message").innerText = message;
  document.getElementById("score").innerText = `${playerName}, tu puntaje final es ${score} (${percentage}%)`;
}

loadQuestions();
