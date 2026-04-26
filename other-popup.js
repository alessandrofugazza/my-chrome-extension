const goToPopupBtn = document.getElementById("go-to-popup-btn");

goToPopupBtn.addEventListener("click", () => {
  chrome.action.setPopup({ popup: "popup.html" });
});
