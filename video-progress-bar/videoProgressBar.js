// let trackingStarted = false;

// function setupVideoTracking(video) {
//   if (trackingStarted) return;

//   trackingStarted = true;

//   console.log("Video detected");

//   setInterval(() => {
//     // only run in fullscreen
//     if (!document.fullscreenElement) {
//       return;
//     }

//     if (!video.duration || Number.isNaN(video.duration)) {
//       return;
//     }

//     const percentage = (video.currentTime / video.duration) * 100;

//     console.log(`Video progress: ${percentage.toFixed(2)}%`);
//   }, 2000);
// }

// const observer = new MutationObserver(() => {
//   const video = document.querySelector("video");

//   if (video) {
//     setupVideoTracking(video);
//   }
// });

// observer.observe(document.body, {
//   childList: true,
//   subtree: true,
// });
