console.log("damn");

chrome.runtime.sendMessage({ type: "pageLoaded" });

function fetchAnnotatedPages() {
  const currentUrl = location.href;
  console.log("Fetching notes for URL:", currentUrl);

  chrome.storage.sync.get(["noteworthyPages"], (res) => {
    const noteworthyPages = res.noteworthyPages ?? {};

    console.log("noteworthyPages:", noteworthyPages);
    console.log("current page:", noteworthyPages[currentUrl]);

    if (noteworthyPages[currentUrl]) {
      chrome.runtime.sendMessage({
        type: "annotatedPageLoaded",
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
