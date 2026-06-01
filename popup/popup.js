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
  const res = await chrome.storage.sync.get(["inProgressPages", "donePages"]);
  const inProgressPages = res.inProgressPages ?? [];
  const donePages = res.donePages ?? [];

  inProgressCheckbox.checked = inProgressPages.includes(currentUrl);
  isDoneCb.checked = donePages.includes(currentUrl);
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

    // clone so we can safely modify
    const updatedPages = { ...pages };

    if (pageNotes.length === 0) {
      // remove the entire URL entry
      delete updatedPages[currentUrl];
    } else {
      const entry = updatedPages[currentUrl] ?? {};

      updatedPages[currentUrl] = {
        ...entry,
        notes: pageNotes,
      };
    }

    chrome.storage.sync.set({
      noteworthyPages: updatedPages,
    });
  });

  updatePageHasNotesIcons();
};

const renderPageNote = (noteNum) => {
  const noteRow = document.createElement("div");
  noteRow.className = "note-row";
  const text = document.createElement("input");
  text.type = "text";
  text.placeholder = "Enter your note here";
  text.value = pageNotes[noteNum].text ?? "";
  text.className = "note-input-text";
  text.addEventListener("change", () => {
    pageNotes[noteNum].text = text.value;
    pageNotes[noteNum].date = new Date().toLocaleDateString();
    savePageNotes();
  });
  const dateSpan = document.createElement("span");
  dateSpan.textContent = pageNotes[noteNum].date
    ? new Date(pageNotes[noteNum].date).toLocaleDateString()
    : new Date().toLocaleDateString();
  dateSpan.className = "note-date";

  const deleteBtn = document.createElement("input");
  deleteBtn.type = "button";
  deleteBtn.value = "X";
  deleteBtn.className = "delete-note-btn";
  deleteBtn.addEventListener("click", () => {
    deleteNote(noteNum);
  });

  noteRow.appendChild(text);
  noteRow.appendChild(dateSpan);
  noteRow.appendChild(deleteBtn);

  pageNotesContainer.appendChild(noteRow);
};

const newNote = () => {
  const noteNum = pageNotes.length;
  pageNotes.push({
    text: "",
    date: new Date().toLocaleDateString(),
  });
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

const isDoneCb = document.getElementById("is-done-cb");

isDoneCb.addEventListener("change", async () => {
  const res = await chrome.storage.sync.get(["donePages"]);
  const donePages = res.donePages ?? [];

  let updatedPages;

  if (isDoneCb.checked) {
    updatedPages = [...new Set([...donePages, currentUrl])];
  } else {
    updatedPages = donePages.filter((url) => url !== currentUrl);
  }

  await chrome.storage.sync.set({
    donePages: updatedPages,
  });
});

initializePopup();
