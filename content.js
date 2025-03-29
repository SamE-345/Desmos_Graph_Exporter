const script = document.createElement("script");
script.src = chrome.runtime.getURL("inject.js");
script.onload = function() {
    console.log("inject.js injected and executed!");
    this.remove(); 
};
(document.head || document.documentElement).appendChild(script);

// Listen for messages from inject.js
window.addEventListener("message", (event) => {
    console.log("Message received in content.js:", event);
    if (event.source !== window || !event.data || event.data.type !== "EXPORT_GRAPH") {
      console.log("Ignored message:", event);
      return;
    }
  
    console.log("Received graph data from inject.js, forwarding to background.js...", event.data.data);
  
    // Forward the data to background.js
    chrome.runtime.sendMessage(
      { action: "exportGraph", data: event.data.data },
      (response) => {
        console.log("Response received from background.js:", response);
    
        if (response && response.success) {
          alert(`Graph exported successfully!\n View it on GitHub: ${response.url}`);
        } else {
          console.error(" GitHub export failed:", response.error);
          alert("Error exporting graph");
        }
      }
    );
  });
  
  