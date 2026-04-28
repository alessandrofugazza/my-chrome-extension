const productionModeBtn = document.getElementById("production-mode-btn");
const pgModeBtn = document.getElementById("pg-mode-btn");

productionModeBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({
    type: "SET_POPUP",
    popup: "popup.html",
  });
});

pgModeBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({
    type: "SET_POPUP",
    popup: "popup-pg.html",
  });
});

const motdInput = document.getElementById("motd-input");
const saveMotdBtn = document.getElementById("save-motd-btn");

saveMotdBtn.addEventListener("click", () => {
  const motd = motdInput.value;
  chrome.storage.sync.set({
    motd,
  });
});

chrome.storage.sync.get(["motd"], (res) => {
  motdInput.value = res.motd ?? "no motd";
});
