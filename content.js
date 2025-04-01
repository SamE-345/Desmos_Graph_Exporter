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
    chrome.runtime.sendMessage({ action: "importGraph", filename: "graph.json" }, (response) => {
        console.log("📥 Response received from background.js:", response);
    
        if (chrome.runtime.lastError) {
            console.error("❌ Error sending message to background:", chrome.runtime.lastError.message);
            alert("Failed to communicate with background script.");
            return;
        }
    
        if (response && response.success) {
            console.log("✅ Graph data received:", response.data);
    
            // Ensure Desmos API (window.Calc) is available
            function waitForDesmosAPI(attempts = 20) {
                if (window.Calc && typeof window.Calc.setState === "function") {
                    console.log("🎯 Setting graph state...");
                    window.Calc.setState(response.data);
                    alert("Graph imported successfully!");
                } else if (attempts > 0) {
                    console.warn("⏳ Waiting for Desmos API...");
                    setTimeout(() => waitForDesmosAPI(attempts - 1), 500);
                } else {
                    console.error("❌ Desmos API not available after multiple attempts.");
                    alert("Error: Desmos API is unavailable.");
                }
            }
    
            waitForDesmosAPI();
        } else {
            console.error("❌ GitHub import failed:", response.error);
            alert("Error importing graph");
        }
    });
  }
});
