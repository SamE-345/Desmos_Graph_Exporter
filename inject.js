// Function to wait for the Desmos API to load
function waitForDesmosAPI(attempts = 20) {
  if (window.Calc && typeof window.Calc.setState === "function") {
      console.log("✅ Desmos API is ready!");
      setupGraphButtons(); // Call the function to set up the buttons after API loads
  } else if (attempts > 0) {
      console.warn("⏳ Waiting for Desmos API...");
      setTimeout(() => waitForDesmosAPI(attempts - 1), 500);
  } else {
      console.error("❌ Desmos API not available after multiple attempts.");
      alert("Error: Desmos API is unavailable.");
  }
}

// Call the function when inject.js is executed
waitForDesmosAPI();

// Function to create and add the Export button
function addExportButton() {
  if (document.getElementById("desmos-git-export")) return;

  const btn = document.createElement("button");
  btn.id = "desmos-git-export";
  btn.innerText = "Export Graph";
  btn.style.cssText = "position: fixed; top: 10px; right: 10px; z-index: 10000; padding: 8px 12px; background-color: #008CBA; color: white; border: none; border-radius: 5px; cursor: pointer;";
  
  btn.addEventListener("click", exportGraph);
  document.body.appendChild(btn);
}

// Function to create and add the Import button
function addImportButton() {
  if (document.getElementById("desmos-git-import")) return;

  const btn = document.createElement("button");
  btn.id = "desmos-git-import";
  btn.innerText = "Import Graph";
  btn.style.cssText = "position: fixed; top: 50px; right: 10px; z-index: 10000; padding: 8px 12px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;";
  
  btn.addEventListener("click", importGraph);
  document.body.appendChild(btn);
}

// Function to export the current graph state
function exportGraph() {
  if (!window.Calc) {
      alert("❌ Desmos API not found");
      return;
  }
  const graphData = window.Calc.getState();
  window.postMessage({ type: "EXPORT_GRAPH", data: graphData }, "*");
}

// Function to import a graph from GitHub
function importGraph() {
  const filename = prompt("Enter the filename to load (e.g., graph.json):");
  if (!filename) {
      alert("❌ No filename provided.");
      return;
  }

  window.postMessage({ type: "IMPORT_GRAPH", filename: filename }, "*");
}

// Ensure Desmos API is ready, then add buttons
waitForDesmosAPI(() => {
  console.log("✅ Desmos API is ready, setting up buttons.");
  addExportButton();
  addImportButton();

  // Set up MutationObserver to re-add buttons if removed
  const observer = new MutationObserver(() => {
      if (!document.getElementById("desmos-git-export")) addExportButton();
      if (!document.getElementById("desmos-git-import")) addImportButton();
  });
  observer.observe(document.body, { childList: true, subtree: true });
});
