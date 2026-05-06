fetchAnnotatedPages();
chrome.runtime.sendMessage({ type: "pageLoaded" });

function fetchAnnotatedPages() {
  const currentUrl = location.href;

  chrome.storage.sync.get(["noteworthyPages"], (res) => {
    const noteworthyPages = res.noteworthyPages ?? {};

    if (noteworthyPages[currentUrl]) {
      chrome.runtime.sendMessage({
        type: "pageHasNotes",
        url: currentUrl,
      });
    } else {
      chrome.runtime.sendMessage({
        type: "pageHasNoNotes",
        url: currentUrl,
      });
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "chromeWindowFocused") {
    fetchAnnotatedPages();
    sendResponse({ ok: true });
  }
});
