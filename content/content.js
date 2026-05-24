// why are we doing this?
// chrome.runtime.sendMessage({ type: "pageLoaded" });

const fetchAnnotatedPages = () => {
  const currentUrl = location.href;

  chrome.storage.sync.get(["noteworthyPages"], (res) => {
    const noteworthyPages = res.noteworthyPages ?? {};

    if (noteworthyPages[currentUrl]) {
      chrome.runtime.sendMessage({
        type: "PAGE_HAS_NOTES",
        url: currentUrl,
      });
    } else {
      chrome.runtime.sendMessage({
        type: "PAGE_HAS_NO_NOTES",
        url: currentUrl,
      });
    }
  });
};

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "WINDOW_WAS_FOCUSED") {
    fetchAnnotatedPages();
  }
});

fetchAnnotatedPages();
