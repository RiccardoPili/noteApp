import { loadData, saveData } from "./persistance.js";

let categorie = [];
let note = [];

const coloriDisponibili = [
  "bg-yellow-300",
  "bg-blue-300",
  "bg-green-300",
  "bg-red-300",
  "bg-purple-300",
  "bg-pink-300",
  "bg-indigo-300",
  "bg-orange-300",
];

function mostraCategorie() {
  const ul = document.getElementById("list-of-categories");
  ul.innerHTML = "";
  categorie.forEach((cat) => {
    const li = document.createElement("li");
    li.className =
      "flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded-md";
    li.innerHTML = `
      <span class="w-3 h-3 ${cat.colore} rounded-full mr-2"></span>
      ${cat.nome}
    `;
    ul.appendChild(li);
  });
}

function mostraNote() {
  const container = document.querySelector(".grid");
  container.innerHTML = "";

  note.forEach((nota, idx) => {
    const div = document.createElement("div");
    div.className = "bg-yellow-100 p-4 rounded-lg shadow hover:shadow-lg mb-2";
    div.innerHTML = `
      <h3 class="font-semibold">${nota.titolo}</h3>
      <p class="text-sm text-gray-500 mb-2">${nota.categoria}</p>
      <p>${nota.contenuto}</p>
      <a href="#" class="text-red-500 hover:underline mt-2" data-idx="${idx}">Delete</a>
    `;
    container.appendChild(div);
  });

  // Gestione delete
  container.querySelectorAll("a[data-idx]").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const idx = parseInt(this.getAttribute("data-idx"));
      note.splice(idx, 1);
      mostraNote();
      saveData(categorie, note);
    });
  });
}

function aggiornaCategorieSelect() {
  const select = document.getElementById("new-note-category-select");
  if (!select) return;
  select.innerHTML = "";
  categorie.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.nome;
    option.textContent = cat.nome;
    select.appendChild(option);
  });
}

// ----------------- MAIN ------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  (async () => {
    const data = await loadData();
    categorie = data.categorie || [];
    note = data.note || [];
    mostraCategorie();
    mostraNote();

    // popupNewCategory gestione
    const popupNewCategory = document.getElementById("popup-category");
    const popupNewNote = document.getElementById("popup-new-note");
    const addCatBtn = document.getElementById("add-category-btn");
    const addNoteBtn = document.getElementById("new-note-btn");
    const cancelBtn = document.getElementById("cancel-category-btn");
    const cancelNewNoteBtn = document.getElementById("cancel-new-note-btn");
    const confirmBtn = document.getElementById("confirm-category-btn");
    const confirmNewNoteBtn = document.getElementById("confirm-new-note-btn");
    const newCatInput = document.getElementById("category-name-input");

    addCatBtn.addEventListener("click", () => {
      popupNewNote.classList.add("hidden");
      popupNewCategory.classList.remove("hidden");
      newCatInput.value = "";
      newCatInput.focus();
    });

    addNoteBtn.addEventListener("click", () => {
      popupNewCategory.classList.add("hidden");
      popupNewNote.classList.remove("hidden");
      aggiornaCategorieSelect();
      const noteTitleInput = document.getElementById("new-note-title-input");
      if (noteTitleInput) {
        noteTitleInput.value = "";
        noteTitleInput.focus();
      }
    });

    cancelBtn.addEventListener("click", () => {
      popupNewCategory.classList.add("hidden");
    });

    cancelNewNoteBtn.addEventListener("click", () => {
      popupNewNote.classList.add("hidden");
    });

    confirmBtn.addEventListener("click", () => {
      const nome = newCatInput.value.trim();
      if (nome) {
        // Colore casuale
        const colore =
          coloriDisponibili[
            Math.floor(Math.random() * coloriDisponibili.length)
          ];
        categorie.push({ nome, colore });
        mostraCategorie();
        aggiornaCategorieSelect();
        saveData(categorie, note);
        popupNewCategory.classList.add("hidden");
      }
    });

    confirmNewNoteBtn.addEventListener("click", () => {
      const titolo = document
        .getElementById("new-note-title-input")
        .value.trim();
      const categoria = document.getElementById(
        "new-note-category-select"
      ).value;
      const contenuto = document
        .getElementById("new-note-content-input")
        .value.trim();
      if (titolo && categoria && contenuto) {
        note.push({ titolo, categoria, contenuto });
        mostraNote();
        saveData(categorie, note);
        // Chiudi il popup e resetta i campi
        popupNewNote.classList.add("hidden");
        document.getElementById("new-note-title-input").value = "";
        document.getElementById("new-note-content-input").value = "";
      }
    });

    newCatInput.addEventListener("keydown", (e) => {
      if (e.key == "Enter") {
        confirmBtn.click();
      }
    });

    // Chiudi entrambi i popup con ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        let closed = false;
        if (!popupNewCategory.classList.contains("hidden")) {
          popupNewCategory.classList.add("hidden");
          closed = true;
        }
        if (!popupNewNote.classList.contains("hidden")) {
          popupNewNote.classList.add("hidden");
          closed = true;
        }
        // Se almeno uno era aperto, previeni altre azioni
        if (closed) e.preventDefault();
      }
    });
  })();
});
