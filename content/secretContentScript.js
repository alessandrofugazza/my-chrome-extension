console.log("Secret content script loaded");
const btn = document.querySelector('[aria-label="Theater Mode"]');

if (btn) {
  btn.click();
}
