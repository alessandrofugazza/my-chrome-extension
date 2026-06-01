console.log("Running Coursera DOM Manipulation script...");

function styleSubtitles() {
  document.querySelectorAll(".vjs-text-track-cue").forEach((cue) => {
    const parent = cue.parentElement;

    if (parent) {
      parent.style.setProperty("font-size", "1.5rem", "important");
      // parent.style.lineHeight = "1.4";
    }

    cue.style.setProperty("font-size", "1.5rem", "important");
    // cue.style.lineHeight = "1.4";

    console.log("Styling subs... done");
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
