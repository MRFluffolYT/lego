export function renderOptions(analysis, onSelect) {
  const container = document.getElementById("optionsContainer");
  container.innerHTML = "";

  const all = [analysis.recommended, ...analysis.alternatives];

  all.forEach(option => {
    const card = document.createElement("div");
    card.className = "option-card";

    card.innerHTML = `
      <h3>${option.label}</h3>
      <p>${option.width} × ${option.height} stud</p>
      <p>${option.description}</p>
    `;

    card.onclick = () => onSelect(option);
    container.appendChild(card);
  });

  document.getElementById("options-section").classList.remove("hidden");
}
