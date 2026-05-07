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

  // make this a function
  const res = await chrome.storage.sync.get(["inProgressPages"]);
  const inProgressPages = res.inProgressPages ?? [];

  inProgressCheckbox.checked = inProgressPages.includes(currentUrl);
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

const updatePageHasNotesIcons = () => {
  const pageHasNotes = pageNotes.length > 0;

  if (pageHasNotes) {
    chrome.action.setBadgeText({ text: "NOTE" });
    chrome.action.setBadgeBackgroundColor({ color: "#d97706" });
  } else {
    chrome.action.setBadgeText({ text: "" });
  }
};

const inProgressCheckbox = document.getElementById("in-progress-checkbox");

inProgressCheckbox.addEventListener("change", async () => {
  const res = await chrome.storage.sync.get(["inProgressPages"]);
  const inProgressPages = res.inProgressPages ?? [];

  let updatedPages;

  if (inProgressCheckbox.checked) {
    updatedPages = [...new Set([...inProgressPages, currentUrl])];
  } else {
    updatedPages = inProgressPages.filter((url) => url !== currentUrl);
  }

  await chrome.storage.sync.set({
    inProgressPages: updatedPages,
  });
});

initializePopup();
