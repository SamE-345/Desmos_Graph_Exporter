// Inject the script into Desmos
const script = document.createElement("script");
script.src = chrome.runtime.getURL("inject.js");
script.onload = function () {
    console.log("inject.js injected and executed!");
    this.remove();
};
(document.head || document.documentElement).appendChild(script);

// Listen for messages from inject.js
window.addEventListener("message", (event) => {
  if (!event.data || (event.data.type !== "EXPORT_GRAPH" && event.data.type !== "IMPORT_GRAPH")) {
      return;
  }

  if (event.data.type === "EXPORT_GRAPH") {
      chrome.runtime.sendMessage({ action: "exportGraph", data: event.data.data }, (response) => {
          if (chrome.runtime.lastError) {
              console.error("❌ Error sending message to background:", chrome.runtime.lastError);
              return;
          }

          if (response && response.success) {
              alert("✅ Graph exported successfully!");
          } else {
              console.error("❌ GitHub export failed:", response?.error);
              alert("❌ Error exporting graph");
          }
      });
  } 
  
  else if (event.data.type === "IMPORT_GRAPH") {
    // In content.js, after receiving response from background.js for importGraph:
chrome.runtime.sendMessage({ action: "importGraph", filename: "graph.json" }, (response) => {
    console.log("✅ Graph data received:", response.data);
    if (response && response.success) {
        // Forward the graph data to the page (inject.js) using window.postMessage
        window.postMessage({ type: "DISPLAY_GRAPH", graphData: response.data }, "*");
    } else {
        console.error("❌ Error importing graph:", response.error);
        alert("Error importing graph");
    }
});


  }
  
});
