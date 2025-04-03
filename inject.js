// Function to wait for the Desmos API to load
function waitForDesmosAPI(attempts = 0, maxAttempts = 50) {
  if (window.Desmos) {
      console.log("✅ Desmos API is ready!");
      setupGraphButtons();
      return;
  }

  if (attempts >= maxAttempts) {
      console.error("❌ Desmos API not available after multiple attempts.");
      return;
  }

  console.log(`⏳ Waiting for Desmos API... (Attempt ${attempts + 1}/${maxAttempts})`);
  
  // Retry after 100ms
  setTimeout(() => waitForDesmosAPI(attempts + 1, maxAttempts), 100);
};

waitForDesmosAPI();
var Graph_Data;

// Call the function when inject.js is executed


function setupGraphButtons(){
  addExportButton();
  addImportButton();
}

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

function ensureDesmosContainer() {
  let existingContainer = document.querySelector("#desmos-container");

  if (!existingContainer) {
      existingContainer = document.createElement("div");
      existingContainer.id = "desmos-container";
      existingContainer.style.width = "600px";
      existingContainer.style.height = "400px";
      document.body.appendChild(existingContainer);
      console.log("✅ Desmos container created!");
  }

  return existingContainer;
}

// Wait until the page loads to inject Desmos
window.addEventListener("message", (event) => {
  // Ensure we only process our own messages
  if (event.source !== window) return;
  if (event.data && event.data.type === "DISPLAY_GRAPH") {
      console.log("Received DISPLAY_GRAPH message:", event.data.graphData);
      if (window.Calc && typeof window.Calc.setState === "function") {
          window.Calc.setState(event.data.graphData);
          alert("✅ Graph imported successfully!");
      } else {
          console.error("❌ Desmos API not available in inject.js");
      }
  }
});




