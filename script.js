let questions = [];
let currentQuestion = 0;
let score = 0;
let playerName = "";

async function loadQuestions() {
  const response = await fetch("questions.json");
  questions = await response.json();
}

function startGame() {
  document.getElementById("welcome-screen").classList.add("hidden");
  document.getElementById("name-screen").classList.remove("hidden");
}

function beginQuestions() {
  playerName = document.getElementById("player-name").value;
  localStorage.setItem("playerName", playerName);
  document.getElementById("name-screen").classList.add("hidden");
  document.getElementById("question-screen").classList.remove("hidden");
  showQuestion();
}

function showPopup(message, type="mal") {
  const popup = document.createElement("div");
  popup.className = "popup";
  popup.innerHTML = `
    <div class="popup-content">
      <span class="close">&times;</span>
      <p>${message}</p>
      <!-- Aquí puedes poner <img src="assets/${type}.png"> o <video src="assets/${type}.mp4" controls></video> -->
    </div>
  `;
  document.body.appendChild(popup);
  popup.querySelector(".close").onclick = () => popup.remove();
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
      if (opt.correct) score += 6.67;

      // Lógica especial para redes sociales
      if (q.text.includes("Instagram") || q.text.includes("Facebook")) {
        if (opt.text === "No" && opt.link) {
          window.open(opt.link, "_blank");
          return; // No avanza si es "No"
        }
      }

      currentQuestion++;

      // Pop-ups en preguntas específicas
      if (currentQuestion === 5 && score < 20) {
        showPopup("¡Vas muy mal en las primeras preguntas!", "mal");
      }
      if (currentQuestion === 8) {
        showPopup("¡Vas muy bien!", "bien");
      }
      if (currentQuestion === 10 && score < 40) {
        showPopup("¡Todavía vas mal, mejora!", "mal");
      }
      if (currentQuestion === 14) {
        showPopup("¡Excelente progreso!", "bien");
      }

      showQuestion();
    };
    optionsDiv.appendChild(btn);
  });
}

function endGame() {
  document.getElementById("question-screen").classList.add("hidden");
  document.getElementById("end-screen").classList.remove("hidden");

  let percentage = Math.round((score / (questions.length * 6.67)) * 100);
  let message = "";

  if (percentage <= 50) message = "Por poco mueres en una dimensión...";
  else if (percentage <= 70) message = "Has sobrevivido, pero con dificultad...";
  else if (percentage <= 90) message = "Eres un gran influencer...";
  else message = "¡Eres nuestro influencer más importante!";

  document.getElementById("final-message").innerText = message;
  document.getElementById("score").innerText = `${playerName}, tu puntaje final es ${percentage}`;
  document.getElementById("score").style.fontSize = "3em"; // Puntaje grande en el centro
}

loadQuestions();
