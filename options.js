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
