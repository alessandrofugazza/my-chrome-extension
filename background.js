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
    const tabId = sender?.tab?.id;
    if (tabId != null) {
      chrome.action.setBadgeText({ tabId, text: "NOTE" });
      chrome.action.setBadgeBackgroundColor({ tabId, color: "#d97706" }); // optional
    }

    chrome.notifications.create({
      type: "basic",
      iconUrl: "../images/icon.png",
      title: "Page annotated",
      message: `Loaded: ${msg.url}`,
    });
  }
});
