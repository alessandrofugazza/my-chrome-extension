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

async function syncInProgressPagesAlarm({ forceRecreate = false } = {}) {
  const res = await chrome.storage.sync.get(["notificationsEnabled", "notificationsInterval"]);

  const notificationsEnabled = res.notificationsEnabled ?? false;
  const notificationsInterval = Number(res.notificationsInterval ?? DEFAULT_INTERVAL);

  if (!notificationsEnabled) {
    await chrome.alarms.clear(ALARM_NAME);
    return;
  }

  if (!forceRecreate) {
    const existingAlarm = await chrome.alarms.get(ALARM_NAME);
    if (existingAlarm) return; // Already scheduled, don't reset it
  }

  await chrome.alarms.clear(ALARM_NAME);
  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: MIN_INTERVAL,
    periodInMinutes: Math.max(notificationsInterval, MIN_INTERVAL),
  });
}

// On service worker restart: only create if missing
syncInProgressPagesAlarm();

// On settings change: force recreate with new interval
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync") return;
  if (changes.notificationsEnabled || changes.notificationsInterval) {
    syncInProgressPagesAlarm({ forceRecreate: true });
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

chrome.runtime.onInstalled.addListener((details) => {
  chrome.contextMenus.create({
    title: "Search this user",
    id: "myContextMenu",
    contexts: ["selection"],
    documentUrlPatterns: ["https://www.reddit.com/*", "https://old.reddit.com/*"],
  });

  chrome.contextMenus.onClicked.addListener((event) => {
    chrome.search.query({
      disposition: "NEW_TAB",
      text: `site:reddit.com ${event.selectionText}`,
    });
  });
});
