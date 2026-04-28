function fetchAnnotatedPages() {
  const currentUrl = location.href;

  chrome.storage.sync.get(["annotatedPages"], (res) => {
    const annotatedPages = res.annotatedPages ?? {};

    if (annotatedPages[currentUrl]) {
      // Tell background to set badge + send notification
      chrome.runtime.sendMessage({
        type: "annotatedPageLoaded",
        url: currentUrl,
      });
    }
  });
}

fetchAnnotatedPages();
