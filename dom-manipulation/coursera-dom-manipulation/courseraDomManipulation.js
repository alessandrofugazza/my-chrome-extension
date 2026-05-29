function styleSubtitles() {
  document.querySelectorAll(".vjs-text-track-cue").forEach((cue) => {
    const parent = cue.parentElement;

    if (parent) {
      parent.style.setProperty("font-size", "2rem", "important");
      // parent.style.lineHeight = "1.4";
    }

    cue.style.setProperty("font-size", "2rem", "important");
    // cue.style.lineHeight = "1.4";
  });
}

styleSubtitles();

const observer = new MutationObserver(() => {
  styleSubtitles();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
