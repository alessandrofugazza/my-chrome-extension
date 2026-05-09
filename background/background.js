chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SET_POPUP") {
    chrome.action.setPopup({ popup: message.popup }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        sendResponse({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }

      sendResponse({ ok: true });
    });

    return true;
  }
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  console.log("Message received in background:", msg);
  if (msg?.type === "pageHasNotes") {
    console.log("Fetching annotated pages...");

    const tabId = sender?.tab?.id;
    if (tabId != null) {
      chrome.action.setBadgeText({ tabId, text: "NOTE" });
      chrome.action.setBadgeBackgroundColor({ tabId, color: "#d97706" }); // optional
    }

    chrome.notifications.create(
      {
        type: "basic",
        iconUrl: chrome.runtime.getURL("images/icon.png"),
        title: "Page annotated",
        message: `Loaded: ${msg.url}`,
      },
      (notificationId) => {
        if (chrome.runtime.lastError) {
          console.error("Notification error:", chrome.runtime.lastError.message);
          return;
        }

        console.log("Notification created:", notificationId);
      },
    );
  } else if (msg?.type === "pageHasNoNotes") {
    const tabId = sender?.tab?.id;

    if (tabId != null) {
      chrome.action.setBadgeText({ tabId, text: "" });
    }
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;

  const [tab] = await chrome.tabs.query({
    active: true,
    windowId,
  });

  if (!tab?.id || !tab.url) return;

  // Ignore pages where content scripts cannot run
  if (
    tab.url.startsWith("chrome://") ||
    tab.url.startsWith("edge://") ||
    tab.url.startsWith("about:") ||
    tab.url.startsWith("chrome-extension://")
  ) {
    return;
  }

  chrome.tabs.sendMessage(tab.id, { type: "chromeWindowFocused" }, (response) => {
    if (chrome.runtime.lastError) {
      console.log("No content script in this tab:", chrome.runtime.lastError.message);
      return;
    }

    console.log("Content script response:", response);
  });
});

const ALARM_NAME = "checkForInProgressPages";
const DEFAULT_INTERVAL = 30;
const MIN_INTERVAL = 0.5; // Chrome minimum is 30 seconds

async function syncInProgressPagesAlarm() {
  const res = await chrome.storage.sync.get(["notificationsEnabled", "notificationsInterval"]);

  const notificationsEnabled = res.notificationsEnabled ?? false;
  const notificationsInterval = Number(res.notificationsInterval ?? DEFAULT_INTERVAL);

  await chrome.alarms.clear(ALARM_NAME);

  if (!notificationsEnabled) {
    console.log("Alarm removed: notifications disabled");
    return;
  }

  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: MIN_INTERVAL,
    periodInMinutes: Math.max(notificationsInterval, MIN_INTERVAL),
  });

  console.log(
    `Alarm created/restarted with interval: ${Math.max(notificationsInterval, MIN_INTERVAL)} minutes and delay: ${MIN_INTERVAL} minutes`,
  );
}

// Run when service worker starts
syncInProgressPagesAlarm();

// Run when options page changes settings
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync") return;

  if (changes.notificationsEnabled || changes.notificationsInterval) {
    syncInProgressPagesAlarm();
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;

  const res = await chrome.storage.sync.get(["inProgressPages", "notificationsEnabled"]);

  if (!res.notificationsEnabled) return;

  const inProgressPages = res.inProgressPages ?? [];
  const inProgressPagesNum = inProgressPages.length;

  if (inProgressPagesNum > 0) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("images/icon.png"),
      title: "You have in progress pages",
      message: `There ${inProgressPagesNum === 1 ? "is" : "are"} ${inProgressPagesNum} ${
        inProgressPagesNum === 1 ? "page" : "pages"
      } marked as in progress.`,
      requireInteraction: true,
    });
  }
});
