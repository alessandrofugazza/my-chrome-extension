console.log("Secret content script loaded");

// function styleSubtitles() {
//   document.querySelectorAll(".vjs-text-track-cue").forEach((cue) => {
//     const parent = cue.parentElement;

//     if (parent) {
//       parent.style.fontSize = "1rem";
//       // parent.style.lineHeight = "1.4";
//     }

//     cue.style.fontSize = "1rem";
//     // cue.style.lineHeight = "1.4";
//   });
// }

// styleSubtitles();

// const observer = new MutationObserver(() => {
//   styleSubtitles();
// });

// observer.observe(document.body, {
//   childList: true,
//   subtree: true,
// });
