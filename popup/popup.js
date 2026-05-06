let currentUrl = "";

const getUrl = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tabs[0]?.url || "";
  console.log("Current URL:", url);
  return url;
};

const initializePopup = async () => {
  currentUrl = await getUrl();
  await fetchPageNotes();
  renderPageNotes();
  updatePageHasNotesIcons();
};

const pageNotesContainer = document.getElementById("page-notes-container");

let pageNotes = [];

const fetchPageNotes = async () => {
  const res = await chrome.storage.sync.get(["noteworthyPages"]);

  const noteworthyPages = res.noteworthyPages ?? {};
  const thisPage = noteworthyPages[currentUrl];

  pageNotes = Array.isArray(thisPage?.notes) ? thisPage.notes : [];
};

const newNoteBtn = document.getElementById("annotate-page-btn");

newNoteBtn.addEventListener("click", () => newNote());

const savePageNotes = () => {
  chrome.storage.sync.get(["noteworthyPages"], (res) => {
    const pages = res.noteworthyPages ?? {};
    const entry = pages[currentUrl] ?? {};

    chrome.storage.sync.set({
      noteworthyPages: {
        ...pages,
        [currentUrl]: {
          ...entry,
          notes: pageNotes,
        },
      },
    });
  });
  updatePageHasNotesIcons();
};

const renderPageNote = (noteNum) => {
  const noteRow = document.createElement("div");
  const text = document.createElement("input");
  text.type = "text";
  text.placeholder = "Enter your note here";
  text.value = pageNotes[noteNum] ?? "";
  text.addEventListener("change", () => {
    pageNotes[noteNum] = text.value;
    savePageNotes();
  });

  const deleteBtn = document.createElement("input");
  deleteBtn.type = "button";
  deleteBtn.value = "X";
  deleteBtn.addEventListener("click", () => {
    deleteNote(noteNum);
  });

  noteRow.appendChild(text);
  noteRow.appendChild(deleteBtn);

  pageNotesContainer.appendChild(noteRow);
};

const newNote = () => {
  const noteNum = pageNotes.length;
  pageNotes.push("");
  renderPageNote(noteNum);
  savePageNotes();
};

const deleteNote = (noteNum) => {
  pageNotes.splice(noteNum, 1);
  renderPageNotes();
  savePageNotes();
};

const renderPageNotes = () => {
  pageNotesContainer.replaceChildren();
  pageNotes.forEach((note, noteNum) => {
    renderPageNote(noteNum);
  });
};

function updatePageHasNotesIcons() {
  const pageHasNotes = pageNotes.length > 0;

  if (pageHasNotes) {
    chrome.action.setBadgeText({ text: "NOTE" });
    chrome.action.setBadgeBackgroundColor({ color: "#d97706" });
  } else {
    chrome.action.setBadgeText({ text: "" });
  }
}

initializePopup();

// develop

// let dNotes = [];

// chrome.storage.sync.get(["dNotes"], (res) => {
//   dNotes = res.dNotes ?? [];
//   dRenderNotes();
// });

// const dNotesContainer = document.getElementById("d-page-notes-container");

// const dNewNoteBtn = document.getElementById("d-annotate-page-btn");

// dNewNoteBtn.addEventListener("click", () => dNewNote());

// const dSaveNotes = () => {
//   chrome.storage.sync.set({ dNotes });
// };

// const dRenderNote = (dNoteNum) => {
//   const dNoteRow = document.createElement("div");
//   const dText = document.createElement("input");
//   dText.type = "text";
//   dText.placeholder = "Enter your note here";
//   dText.value = dNotes[dNoteNum] ?? "";
//   dText.addEventListener("change", () => {
//     dNotes[dNoteNum] = dText.value;
//     dSaveNotes();
//   });

//   const dDeleteBtn = document.createElement("input");
//   dDeleteBtn.type = "button";
//   dDeleteBtn.value = "X";
//   dDeleteBtn.addEventListener("click", () => {
//     dDeleteNote(dNoteNum);
//   });

//   dNoteRow.appendChild(dText);
//   dNoteRow.appendChild(dDeleteBtn);

//   dNotesContainer.appendChild(dNoteRow);
// };

// const dNewNote = () => {
//   const dNoteNum = dNotes.length;
//   dNotes.push("");
//   dRenderNote(dNoteNum);
//   dSaveNotes;
// };

// const dDeleteNote = (dNoteNum) => {
//   dNotes.splice(dNoteNum, 1);
//   dRenderNotes();
//   dSaveNotes();
// };

// const dRenderNotes = () => {
//   dNotesContainer.replaceChildren();
//   dNotes.forEach((dNoteText, dNoteNum) => {
//     dRenderNote(dNoteNum);
//   });
// };
