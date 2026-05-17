console.log("Secret content script loaded");
const btn = document.querySelector('[aria-label="Theater Mode"]');

if (btn) {
  btn.click();
}

let lastRightClickedElement = null;
let videoOnlyEnabled = false;
let originalBodyChildren = [];
let originalVideoParent = null;
let originalVideoNextSibling = null;
let selectedVideo = null;

document.addEventListener(
  "contextmenu",
  (event) => {
    lastRightClickedElement = event.target;
  },
  true,
);

chrome.runtime.onMessage.addListener((message) => {
  if (message.action !== "toggle-video-only") return;

  if (videoOnlyEnabled) {
    restorePage();
  } else {
    isolateVideo();
  }
});

function isolateVideo() {
  const video = lastRightClickedElement?.closest?.("video") || document.querySelector("video");

  if (!video) return;

  selectedVideo = video;
  videoOnlyEnabled = true;

  originalVideoParent = video.parentNode;
  originalVideoNextSibling = video.nextSibling;
  originalBodyChildren = Array.from(document.body.children);

  document.body.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.id = "__video_only_wrapper__";

  wrapper.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    background: black;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  video.style.cssText = `
    width: 100vw;
    height: 100vh;
    object-fit: contain;
    background: black;
  `;

  wrapper.appendChild(video);
  document.body.appendChild(wrapper);
}

function restorePage() {
  if (!videoOnlyEnabled) return;

  const wrapper = document.querySelector("#__video_only_wrapper__");

  if (selectedVideo && originalVideoParent) {
    if (originalVideoNextSibling) {
      originalVideoParent.insertBefore(selectedVideo, originalVideoNextSibling);
    } else {
      originalVideoParent.appendChild(selectedVideo);
    }
  }

  document.body.innerHTML = "";

  for (const child of originalBodyChildren) {
    document.body.appendChild(child);
  }

  wrapper?.remove();

  videoOnlyEnabled = false;
}
