let currentUrl = "";

const getUrl = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tabs[0]?.url || "";
  console.log("Current URL:", url);
  return url;
};

const initializePopup = async () => {
  currentUrl = await getUrl();
  fetchAnnotatedPages();
};

const notesContainer = document.getElementById("page-notes-container");

function fetchAnnotatedPages() {
  notesContainer.replaceChildren();

  chrome.storage.sync.get(["noteworthyPages"], (res) => {
    const noteworthyPages = res.noteworthyPages ?? {};
    const entry = noteworthyPages[currentUrl];

    if (entry && Array.isArray(entry.notes) && entry.notes.length > 0) {
      const notes = entry.notes;
      const notesList = document.createElement("ul");

      notes.forEach((note, index) => {
        const noteLi = document.createElement("li");

        const noteSpan = document.createElement("span");
        noteSpan.textContent = note;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.style.marginLeft = "8px";

        deleteBtn.addEventListener("click", () => {
          chrome.storage.sync.get(["noteworthyPages"], (res) => {
            const noteworthyPages = res.noteworthyPages ?? {};
            const entry = noteworthyPages[currentUrl];

            if (!entry || !Array.isArray(entry.notes)) return;

            entry.notes.splice(index, 1);

            if (entry.notes.length === 0) {
              delete noteworthyPages[currentUrl];
            } else {
              noteworthyPages[currentUrl] = entry;
            }

            chrome.storage.sync.set({ noteworthyPages }, () => {
              fetchAnnotatedPages();
            });
          });
        });

        noteLi.appendChild(noteSpan);
        noteLi.appendChild(deleteBtn);
        notesList.appendChild(noteLi);
      });

      notesContainer.appendChild(notesList);

      // chrome.action.setBadgeText({ text: "NOTE" }, () => {
      //   console.log("Badge text set to NOTE");
      // });
      // chrome.action.setBadgeBackgroundColor({ color: "#d97706" }, () => {
      //   console.log("Badge background color set to #d97706");
      // });
    } else {
      notesContainer.appendChild(document.createTextNode("No notes for this page."));
      // chrome.action.setBadgeText({ text: null }, () => {
      //   console.log("Badge text set to null");
      // });
    }

    updatePageHasNotesIcons();
  });
}

const newNoteBtn = document.getElementById("annotate-page-btn");

const newNote = () => {
  const noteRow = document.createElement("div");
  const text = document.createElement("input");
  text.type = "text";
  text.placeholder = "Enter your note here";
  const deleteBtn = document.createElement("input");
  deleteBtn.type = "button";
  deleteBtn.value = "X";

  noteRow.appendChild(text);
  noteRow.appendChild(deleteBtn);

  notesContainer.appendChild(noteRow);
};

newNoteBtn.addEventListener("click", () => {
  const newNote = window.prompt("Enter a value:");
  if (!newNote) return;

  chrome.storage.sync.get(["noteworthyPages"], (res) => {
    const noteworthyPages = res.noteworthyPages ?? {};

    const existingEntry = noteworthyPages[currentUrl] || {
      notes: [],
    };

    existingEntry.notes.push(newNote);
    noteworthyPages[currentUrl] = existingEntry;

    chrome.storage.sync.set({ noteworthyPages }, () => {
      console.log("Page annotated successfully.");
      fetchAnnotatedPages();
    });
  });
});

const pageHasNotesIcon = document.getElementById("page-has-notes-icon");

function updatePageHasNotesIcons() {
  chrome.storage.sync.get(["noteworthyPages"], (res) => {
    console.log("Fetched noteworthy pages:", res.noteworthyPages);

    const pages = res.noteworthyPages || {};
    const entry = pages[currentUrl];

    const pageHasNotes = entry && Array.isArray(entry.notes) && entry.notes.length > 0;

    pageHasNotesIcon.style.width = "20px";
    pageHasNotesIcon.style.height = "20px";
    pageHasNotesIcon.style.borderRadius = "50%";
    pageHasNotesIcon.style.backgroundColor = pageHasNotes ? "green" : "red";

    if (pageHasNotes) {
      chrome.action.setBadgeText({ text: "NOTE" });
      chrome.action.setBadgeBackgroundColor({ color: "#d97706" });
      console.log("This page has notes");
    } else {
      chrome.action.setBadgeText({ text: null });
      console.log("This page has NO notes");
    }
  });
}

initializePopup();
