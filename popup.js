const testElement = document.getElementById("test");

const systemInfo = {
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  language: navigator.language,
  languages: navigator.languages,
  online: navigator.onLine,
  cpuCores: navigator.hardwareConcurrency,
  memoryGB: navigator.deviceMemory,
};

const screenInfo = {
  width: screen.width,
  height: screen.height,
  availWidth: screen.availWidth,
  availHeight: screen.availHeight,
  pixelRatio: window.devicePixelRatio,
};

function renderSystemInfo(data) {
  const container = document.getElementById("system-info");

  container.innerHTML = `
    <h2>System Info</h2>
    <ul>
      <li><strong>User Agent:</strong> ${data.userAgent}</li>
      <li><strong>Platform:</strong> ${data.platform}</li>
      <li><strong>Language:</strong> ${data.language}</li>
      <li><strong>Languages:</strong> ${data.languages.join(", ")}</li>
      <li><strong>Online:</strong> ${data.online}</li>
      <li><strong>CPU Cores:</strong> ${data.cpuCores}</li>
      <li><strong>Memory (GB):</strong> ${data.memoryGB ?? "N/A"}</li>
    </ul>
  `;
}

function renderScreenInfo(data) {
  const container = document.getElementById("screen-info");

  container.innerHTML = `
    <h2>Screen Info</h2>
    <ul>
      <li><strong>width:</strong> ${screen.width}</li>
      <li><strong>height:</strong> ${screen.height}</li>
      <li><strong>availWidth:</strong> ${screen.availWidth}</li>
      <li><strong>availHeight:</strong> ${screen.availHeight}</li>
      <li><strong>pixelRatio:</strong> ${window.devicePixelRatio}</li>
    </ul>
  `;
}

renderSystemInfo(systemInfo);
renderScreenInfo(screenInfo);

chrome.action.setBadgeText({ text: "MCE" }, () => {
  console.log("Badge text set to MCE");
});

const goToOtherPopupBtn = document.getElementById("go-to-other-popup-btn");

goToOtherPopupBtn.addEventListener("click", () => {
  chrome.action.setPopup({ popup: "other-popup.html" }, () => {
    console.log("Badge text set to MCE");
  });
});
