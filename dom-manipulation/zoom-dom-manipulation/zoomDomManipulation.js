console.log("Running Zoom DOM Manipulation script...");

function styleSubtitles() {
  document.querySelectorAll(".vjs-text-track-cue").forEach((cue) => {
    const parent = cue.parentElement;

    if (parent) {
      parent.style.setProperty("font-size", "3.5rem", "important");
      parent.style.lineHeight = "1.3";
    }

    cue.style.setProperty("font-size", "3.5rem", "important");
    cue.style.lineHeight = "1.3";

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
