const script = document.createElement("script");
script.src = chrome.runtime.getURL("inject.js");

script.onload = function() {
    console.log("inject.js injected and executed!");
    this.remove();
};
(document.head || document.documentElement).appendChild(script);

window.addEventListener("message", (event) => {
    if (event.source !== window || !event.data || (event.data.type !== "EXPORT_GRAPH" && event.data.type !== "IMPORT_GRAPH")) {
      return;
    }

    if (event.data.type === "EXPORT_GRAPH") {
        chrome.runtime.sendMessage(
          { action: "exportGraph", data: event.data.data },
          (response) => {
            if (response && response.success) {
              alert(`Graph exported successfully!`);
            } else {
              alert("Error exporting graph.");
            }
          }
        );
    } else if (event.data.type === "IMPORT_GRAPH") {
        chrome.runtime.sendMessage(
          { action: "importGraph" },
          (response) => {
            if (response && response.success) {
              alert(`Graph imported successfully!`);
            } else {
              alert("Error importing graph.");
            }
          }
        );
    }
});
