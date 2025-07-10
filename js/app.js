import { loadData, saveData } from "./persistance.js";

let categorie = [];
let note = [];
let categoriaSelezionata = null; // null = tutte le note
let termineRicerca = ""; // Termine di ricerca corrente

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

function aggiornaTitolo() {
  const titoloElement = document.querySelector("h1");
  if (categoriaSelezionata) {
    titoloElement.textContent = categoriaSelezionata;
  } else {
    titoloElement.textContent = "All Notes";
  }
}

function mostraCategorie() {
  const ul = document.getElementById("list-of-categories");
  ul.innerHTML = "";
  
  categorie.forEach((cat, idx) => {
    const li = document.createElement("li");
    const isSelected = categoriaSelezionata === cat.nome;
    li.className = `flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer ${
      isSelected ? 'bg-gray-200 ring-2 ring-blue-500' : ''
    }`;
    li.innerHTML = `
      <span class="w-3 h-3 ${cat.colore} rounded-full mr-2"></span>
      <span class="flex-1" data-category="${cat.nome}">${cat.nome}</span>
      <button class="ml-auto p-1 rounded hover:bg-gray-200" data-more-idx="${idx}" title="Modifica categoria">
        <img src="assets/edit-icon.svg" alt="Modifica categoria" class="w-5 h-5" />
      </button>
    `;
    ul.appendChild(li);
  });
}

function filtraNote() {
  // Prima filtro per categoria
  let noteFiltrate = categoriaSelezionata 
    ? note.filter(nota => nota.categoria === categoriaSelezionata)
    : note;

  // Poi filtro per termine di ricerca
  if (termineRicerca.trim() !== "") {
    const termine = termineRicerca.toLowerCase();
    noteFiltrate = noteFiltrate.filter(nota => 
      nota.titolo.toLowerCase().includes(termine) || 
      nota.contenuto.toLowerCase().includes(termine)
    );
  }

  return noteFiltrate;
}

function evidenziaTestoRicerca(testo, termine) {
  if (!termine || termine.trim() === "") return testo;
  
  const regex = new RegExp(`(${termine.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return testo.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
}

function mostraNote() {
  const container = document.querySelector(".grid");
  container.innerHTML = "";

  const noteFiltrate = filtraNote();

  if (noteFiltrate.length === 0) {
    const noNotesDiv = document.createElement("div");
    noNotesDiv.className = "col-span-full text-center py-8 text-gray-500";
    let messaggio = "";
    
    if (termineRicerca.trim() !== "") {
      messaggio = `No notes found for "${termineRicerca}"`;
      if (categoriaSelezionata) {
        messaggio += ` in category "${categoriaSelezionata}"`;
      }
    } else {
      messaggio = categoriaSelezionata 
        ? `No notes in category "${categoriaSelezionata}"` 
        : 'No notes available';
    }
    
    noNotesDiv.innerHTML = `<p class="text-lg">${messaggio}</p>`;
    container.appendChild(noNotesDiv);
    return;
  }

  noteFiltrate.forEach((nota) => {
    const originalIdx = note.findIndex(n => n === nota); // Trova l'indice originale
    const cat = categorie.find((c) => c.nome === nota.categoria);
    let coloreNota = "bg-yellow-100";
    if (cat && cat.colore) {
      coloreNota = cat.colore.replace("-300", "-100");
    }

    // Evidenzia il termine di ricerca nel titolo e contenuto
    const titoloEvidenziato = evidenziaTestoRicerca(nota.titolo, termineRicerca);
    const contenutoEvidenziato = evidenziaTestoRicerca(nota.contenuto, termineRicerca);

    const div = document.createElement("div");
    div.className = `${coloreNota} p-4 rounded-lg shadow hover:shadow-lg mb-2 h-60 overflow-hidden flex flex-col`;
    div.innerHTML = `
      <h3 class="font-semibold truncate">${titoloEvidenziato}</h3>
      <p class="text-sm text-gray-500 mb-2">${nota.categoria}</p>
      <p class="overflow-hidden text-ellipsis line-clamp-5">${contenutoEvidenziato}</p>
      <div class="flex justify-end mt-auto">
        <a href="#" class="text-red-500 hover:underline" data-idx="${originalIdx}">Delete</a>
      </div>
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

  select.innerHTML = `<option value="" disabled selected hidden>Select Category</option>`;

  categorie.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.nome;
    option.textContent = cat.nome;
    select.appendChild(option);
  });
}

function selezionaCategoria(nomeCategoria) {
  categoriaSelezionata = nomeCategoria === 'all' ? null : nomeCategoria;
  mostraCategorie();
  mostraNote();
  aggiornaTitolo();
}

function gestisciRicerca(termine) {
  termineRicerca = termine;
  mostraNote();
}

// ----------------- MAIN ------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  (async () => {
    const data = await loadData();
    categorie = data.categorie || [];
    note = data.note || [];
    mostraCategorie();
    mostraNote();
    aggiornaTitolo();

    // Gestione ricerca in tempo reale
    const searchBar = document.getElementById("search-bar");
    if (searchBar) {
      searchBar.addEventListener("input", (e) => {
        gestisciRicerca(e.target.value);
      });
      
      // Pulisci ricerca quando si preme ESC nella search bar
      searchBar.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          searchBar.value = "";
          gestisciRicerca("");
          searchBar.blur();
        }
      });
    }

    // Gestione click sul pulsante "Show All Notes"
    document.getElementById("show-all-notes").addEventListener("click", () => {
      selezionaCategoria('all');
    });

    // Gestione click sulle categorie
    document.getElementById("list-of-categories").addEventListener("click", (e) => {
      const categorySpan = e.target.closest("span[data-category]");
      const editBtn = e.target.closest("button[data-more-idx]");
      
      if (categorySpan && !editBtn) {
        const categoria = categorySpan.getAttribute("data-category");
        selezionaCategoria(categoria);
      } else if (editBtn) {
        // Gestione apertura popup edit categoria
        const editingCatIdx = parseInt(editBtn.getAttribute("data-more-idx"));
        const editCatInput = document.getElementById("edit-category-name-input");
        const popupEditCategory = document.getElementById("popup-edit-category");
        
        editCatInput.value = categorie[editingCatIdx].nome;
        popupEditCategory.classList.remove("hidden");
        editCatInput.focus();
        
        // Salva l'indice per le altre funzioni
        window.editingCatIdx = editingCatIdx;
      }
    });

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

    // --- Elementi per edit categoria ---
    const popupEditCategory = document.getElementById("popup-edit-category");
    const editCatInput = document.getElementById("edit-category-name-input");
    const cancelEditCatBtn = document.getElementById("cancel-edit-category-btn");
    const confirmEditCatBtn = document.getElementById("confirm-edit-category-btn");
    const deleteCatBtn = document.getElementById("delete-category-btn");

    addCatBtn.addEventListener("click", () => {
      popupNewNote.classList.add("hidden");
      popupNewCategory.classList.remove("hidden");
      newCatInput.value = "";
      newCatInput.focus();
    });

    // Salva modifica categoria
    confirmEditCatBtn.addEventListener("click", () => {
      const nuovoNome = editCatInput.value.trim();
      if (!nuovoNome) return;
      if (nuovoNome.length > 16) {
        alert("Category Name is too long");
        return;
      }
      
      const oldNome = categorie[window.editingCatIdx].nome;
      categorie[window.editingCatIdx].nome = nuovoNome;
      
      // Aggiorna tutte le note associate
      note.forEach((n) => {
        if (n.categoria === oldNome) n.categoria = nuovoNome;
      });
      
      // Se la categoria corrente era selezionata, aggiorna la selezione
      if (categoriaSelezionata === oldNome) {
        categoriaSelezionata = nuovoNome;
        aggiornaTitolo();
      }
      
      mostraCategorie();
      mostraNote();
      aggiornaCategorieSelect();
      saveData(categorie, note);
      popupEditCategory.classList.add("hidden");
    });

    // Cancella categoria e note associate
    deleteCatBtn.addEventListener("click", () => {
      if (!confirm("Are you sure you want to delete this category and all its notes?")) {
        return;
      }
      
      const nomeDaEliminare = categorie[window.editingCatIdx].nome;
      categorie.splice(window.editingCatIdx, 1);
      note = note.filter((n) => n.categoria !== nomeDaEliminare);
      
      // Se la categoria eliminata era selezionata, mostra tutte le note
      if (categoriaSelezionata === nomeDaEliminare) {
        categoriaSelezionata = null;
        aggiornaTitolo();
      }
      
      mostraCategorie();
      mostraNote();
      aggiornaCategorieSelect();
      saveData(categorie, note);
      popupEditCategory.classList.add("hidden");
    });

    // Annulla modifica
    cancelEditCatBtn.addEventListener("click", () => {
      popupEditCategory.classList.add("hidden");
    });

    // Chiudi popup edit con Enter
    editCatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") confirmEditCatBtn.click();
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
      if (!nome) return;
      if (nome.length > 16) {
        alert("Category Name is too long");
        return;
      }
      if (nome) {
        const colore = coloriDisponibili[Math.floor(Math.random() * coloriDisponibili.length)];
        categorie.push({ nome, colore });
        mostraCategorie();
        aggiornaCategorieSelect();
        saveData(categorie, note);
        popupNewCategory.classList.add("hidden");
      }
    });

    confirmNewNoteBtn.addEventListener("click", () => {
      const titolo = document.getElementById("new-note-title-input").value.trim();
      const categoria = document.getElementById("new-note-category-select").value;
      const contenuto = document.getElementById("new-note-content-input").value.trim();
      
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
      if (e.key === "Enter") {
        confirmBtn.click();
      }
    });

    // Chiudi popup con ESC
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
        if (!popupEditCategory.classList.contains("hidden")) {
          popupEditCategory.classList.add("hidden");
          closed = true;
        }
        if (closed) e.preventDefault();
      }
    });
  })();
});