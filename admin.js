// Simulación: en un entorno real, aquí se recibirían datos de los jugadores vía servidor.
// Por ahora usaremos localStorage para pruebas.

function loadResults() {
  const results = JSON.parse(localStorage.getItem("gameResults")) || [];
  const tbody = document.getElementById("results-body");
  tbody.innerHTML = "";

  results.forEach(r => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${r.name}</td>
      <td>${r.score}%</td>
      <td>${r.question}</td>
    `;
    tbody.appendChild(row);
  });
}

function downloadResults() {
  const results = JSON.parse(localStorage.getItem("gameResults")) || [];
  let csv = "Nombre,Puntaje,Pregunta\n";
  results.forEach(r => {
    csv += `${r.name},${r.score},${r.question}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resultados.csv";
  a.click();
}

function clearResults() {
  localStorage.removeItem("gameResults");
  loadResults();
}

// Cargar resultados al abrir
window.onload = loadResults;
