console.log("Background script loaded");

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
  if (msg?.type === "annotatedPageLoaded") {
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
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    return;
  }

  const [tab] = await chrome.tabs.query({
    active: true,
    windowId,
  });

  if (!tab?.id) return;

  chrome.tabs.sendMessage(tab.id, {
    type: "chromeWindowFocused",
  });
});
