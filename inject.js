function waitForDesmosAPI(callback, attempts = 20) {
  if (window.Calc) {
    callback();
  } else {
    console.warn("Waiting for Desmos API...");
    if (attempts > 0) {
      setTimeout(() => waitForDesmosAPI(callback, attempts - 1), 500);
    } else {
      console.error("Desmos API not found after multiple attempts.");
    }
  }
}

function addExportButton() {
  if (document.getElementById("desmos-git-export")) return;
  
  const btn = document.createElement("button");
  btn.id = "desmos-git-export";
  btn.innerText = "Export Graph";
  btn.style.cssText = "position: fixed; top: 10px; right: 10px; z-index: 10000; padding: 8px 12px; background-color: #008CBA; color: white; border: none; border-radius: 5px; cursor: pointer;";
  btn.addEventListener("click", exportGraph);
  document.body.appendChild(btn);
}

function addImportButton(){
  if (document.getElementById("desmos-git-import")) return;

  const btn = document.createElement("button");
  btn.id = "desmos-git-import";
  btn.innerText = "Import Graph";
  btn.style.cssText = "position: fixed; top: 10px; right: 130px; z-index: 10000; padding: 8px 12px; background-color: #008CBA; color: white; border: none; border-radius: 5px; cursor: pointer;";
  btn.addEventListener("click", importGraph);
  document.body.appendChild(btn);
}

function exportGraph() {
  if (!window.Calc) {
    alert("❌ Desmos API not found");
    return;
  }
  const graphData = window.Calc.getState();
  window.postMessage({ type: "EXPORT_GRAPH", data: graphData }, "*");
}

function importGraph() {
  window.postMessage({ type: "IMPORT_GRAPH" }, "*");
}

waitForDesmosAPI(() => {
  console.log("Desmos API is ready, setting up buttons.");
  addExportButton();
  addImportButton();

  const observer = new MutationObserver(() => {
    if (!document.getElementById("desmos-git-export")) {
      addExportButton();
    }
    if (!document.getElementById("desmos-git-import")) {
      addImportButton();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
