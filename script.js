let questions = [];
let currentQuestion = 0;
let score = 0;
let playerName = "";

// ✅ Cargar preguntas desde questions.json al inicio
async function loadQuestions() {
  try {
    const response = await fetch("questions.json");
    questions = await response.json();
    console.log("Preguntas cargadas:", questions); // Verifica en consola
  } catch (error) {
    console.error("Error cargando preguntas:", error);
  }
}

function startGame() {
  document.getElementById("welcome-screen").classList.add("hidden");
  document.getElementById("name-screen").classList.remove("hidden");

  // ✅ Fondo especial para la pantalla de nombre osea donde ingresa el nombre 😅
  document.getElementById("name-screen").style.backgroundImage = 'url("assets/usuario.png")';
  document.getElementById("name-screen").style.backgroundSize = "cover";
  document.getElementById("name-screen").style.backgroundPosition = "center";
}

// ✅ Iniciar juego sin guardar duplicados
async function beginQuestions() {
  playerName = document.getElementById("player-name").value;

  document.getElementById("name-screen").classList.add("hidden");
  document.getElementById("question-screen").classList.remove("hidden");

  // Si aún no se han cargado las preguntas, espera
  if (questions.length === 0) {
    await loadQuestions();
  }

  showQuestion();
}

function showPopup(message, type="mal") {
  const popup = document.createElement("div");
  popup.className = "popup";
  popup.innerHTML = `
    <div class="popup-content">
      <span class="close">&times;</span>
      <p>${message}</p>
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

  // ✅ Cambiar fondo según la pregunta actual 🤞🏻
  document.getElementById("question-screen").style.backgroundImage = `url("assets/fondo${currentQuestion + 1}.jpg")`;
  document.getElementById("question-screen").style.backgroundSize = "cover";
  document.getElementById("question-screen").style.backgroundPosition = "center";

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

      // ✅ Guardar progreso parcial en localStorage
      let partialPercentage = Math.round((score / (questions.length * 6.67)) * 100);
      let results = JSON.parse(localStorage.getItem("gameResults")) || [];

      // Buscar si ya existe un registro para este jugador
      let existing = results.find(r => r.name === playerName);
      if (existing) {
        existing.score = partialPercentage;
        existing.question = currentQuestion;
      } else {
        results.push({ name: playerName, score: partialPercentage, question: currentQuestion });
      }

      localStorage.setItem("gameResults", JSON.stringify(results));

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

  // ✅ Fondo especial para el resultado
  document.getElementById("end-screen").style.backgroundImage = 'url("assets/fondoFinal.jpg")';
  document.getElementById("end-screen").style.backgroundSize = "cover";
  document.getElementById("end-screen").style.backgroundPosition = "center";

  let percentage = Math.round((score / (questions.length * 6.67)) * 100);
  let message = "";

  if (percentage <= 50) message = "Por poco mueres... ¡Inténtalo de nuevo!";
  else if (percentage <= 70) message = "Has sobrevivido, pero con dificultad...";
  else if (percentage <= 90) message = "Eres un gran jugador...";
  else message = "¡Eres nuestro jugador más importante!";

  document.getElementById("final-message").innerText = message;
  document.getElementById("score").innerText = `${playerName}, tu puntaje final es ${percentage}`;
  document.getElementById("score").style.fontSize = "3em";

  // ✅ Guardar resultado final para administrador
  let results = JSON.parse(localStorage.getItem("gameResults")) || [];
  let existing = results.find(r => r.name === playerName);
  if (existing) {
    existing.score = percentage;
    existing.question = currentQuestion;
  } else {
    results.push({ name: playerName, score: percentage, question: currentQuestion });
  }
  localStorage.setItem("gameResults", JSON.stringify(results));
}

// ✅ Llamar a la carga inicial de preguntas
loadQuestions();
