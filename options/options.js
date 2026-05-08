const productionModeBtn = document.getElementById("production-mode-btn");
const pgModeBtn = document.getElementById("pg-mode-btn");

productionModeBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({
    type: "SET_POPUP",
    popup: "popup/popup.html",
  });
});

pgModeBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({
    type: "SET_POPUP",
    popup: "popup-pg/popup-pg.html",
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

const notificationsIntervalInput = document.getElementById("notifications-interval-input");
const enableNotificationsCheckbox = document.getElementById("enable-notifications-checkbox");

notificationsIntervalInput.addEventListener("change", () => {
  const interval = parseInt(notificationsIntervalInput.value);
  if (isNaN(interval) || interval < 1 || interval > 60) {
    notificationsIntervalInput.value = 30; // Reset to default if invalid
  }
  chrome.storage.sync.set({ notificationsInterval: interval });
});

enableNotificationsCheckbox.addEventListener("change", () => {
  const enabled = enableNotificationsCheckbox.checked;
  chrome.storage.sync.set({ notificationsEnabled: enabled });
});

chrome.storage.sync.get(["notificationsInterval", "notificationsEnabled"], (res) => {
  notificationsIntervalInput.value = res.notificationsInterval ?? 30;
  enableNotificationsCheckbox.checked = res.notificationsEnabled ?? true;
});
