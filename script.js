let questions = [];
let currentQuestion = 0;
let score = 0;
let playerName = "";
let hadBadPopup = false; // ✅ bandera para marcar si hubo algún popup malo

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

  // ✅ Fondo especial para la pantalla de nombre
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

// ✅ Pop-up con imagen según pregunta y tipo
function showPopup(message, type="mal") {
  const popup = document.createElement("div");
  popup.className = "popup";

  // Selecciona la imagen según la pregunta y el tipo
  let imageSrc = "";
  if (type === "mal" && currentQuestion === 5) imageSrc = "assets/popup5_mal.png";
  else if (type === "bien" && currentQuestion === 8) imageSrc = "assets/popup8_bien.png";
  else if (type === "mal" && currentQuestion === 10) imageSrc = "assets/popup10_mal.png";
  else if (type === "bien" && currentQuestion === 14) imageSrc = "assets/popup14_bien.png";
  else if (type === "mal") imageSrc = "assets/popup_mal.png";   // genérico
  else if (type === "bien") imageSrc = "assets/popup_bien.png"; // genérico

  popup.innerHTML = `
    <div class="popup-content">
      <span class="close">&times;</span>
      ${imageSrc ? `<img src="${imageSrc}" alt="${type}" style="width:200px; margin-bottom:15px;">` : ""}
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

  // ✅ Cambiar fondo cada 5 preguntas (usa formato .png)
  let fondoIndex = Math.floor(currentQuestion / 5) + 1;
  document.getElementById("question-screen").style.backgroundImage = `url("assets/fondo${fondoIndex}.png")`;
  document.getElementById("question-screen").style.backgroundSize = "cover";
  document.getElementById("question-screen").style.backgroundPosition = "center";

  document.getElementById("dialogue").innerText = q.text;
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt.text;
    btn.onclick = () => {
      if (opt.correct) score += 10;

      // Lógica especial para redes sociales
      if (q.text.includes("Instagram") || q.text.includes("Facebook")) {
        if (opt.text === "No" && opt.link) {
          window.open(opt.link, "_blank");
          return; // No avanza si es "No"
        }
      }

      currentQuestion++;

      // ✅ Guardar progreso parcial en localStorage
      let partialPercentage = Math.round((score / (questions.length * 10)) * 150);
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

      // ✅ Pop-ups en preguntas específicas con imágenes
      if (currentQuestion === 5 && score < 30) {
        showPopup("¡Vas muy mal en las primeras preguntas!", "mal");
        hadBadPopup = true;
      }
      if (currentQuestion === 8) {
        showPopup("¡Vas muy bien!", "bien");
      }
      if (currentQuestion === 10 && score < 100) {
        showPopup("¡Estas medio mal, mejora!", "mal");
        hadBadPopup = true;
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

  let percentage = Math.round((score / (questions.length * 10)) * 150);
  let message = "";
  let fondoFinal = "";

  // ✅ Si tuvo algún popup malo, el resultado no puede ser "excelente"
  if (hadBadPopup) {
  message = "Tuviste errores importantes... ¡Inténtalo de nuevo!";
  fondoFinal = "assets/fondofinalmalo.png";
} else {
  if (percentage <= 90) {
    message = "Por poco mueres... ¡Inténtalo de nuevo!";
    fondoFinal = "assets/fondofinalmalo.png";
  } else if (percentage <= 120) {
    message = "Has sobrevivido, pero con dificultad...";
    fondoFinal = "assets/fondofinalmedio.png";
  } else if (percentage <= 140) {
    message = "Eres un gran jugador...";
    fondoFinal = "assets/fondofinalbueno.png";
  } else {
    message = "¡Eres nuestro jugador más importante!";
    fondoFinal = "assets/fondofinalexcelente.png";
  }
}

  // ✅ Aplicar fondo elegido
  document.getElementById("end-screen").style.backgroundImage = `url("${fondoFinal}")`;
  document.getElementById("end-screen").style.backgroundSize = "cover";
  document.getElementById("end-screen").style.backgroundPosition = "center";

  // ✅ Mostrar mensaje y puntaje juntos en un solo bloque
  document.getElementById("final-message").innerText = `${message}\n${playerName}, tu puntaje final es ${percentage}`;
  document.getElementById("final-message").style.fontSize = "2em";
  document.getElementById("final-message").style.whiteSpace = "pre-line"; // respeta salto de línea

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
