const GITHUB_TOKEN = "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"; 

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ githubToken: GITHUB_TOKEN }, () => {
    console.log("GitHub token stored!");
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in background.js:", message);

  chrome.storage.local.get("githubToken", async (result) => {
    const token = result.githubToken;
    if (!token) {
      console.error("GitHub token is missing!");
      sendResponse({ success: false, error: "GitHub token not found." });
      return;
    }

    const repoOwner = "SamE-345";
    const repoName = "Desmos_Graph_Exporter";
    const filePath = "Desmos/graph.json";

    if (message.action === "exportGraph") {
      console.log("Exporting graph data:", message.data);
      const graphData = JSON.stringify(message.data, null, 2);
      const commitMessage = "Auto-exported Desmos graph";
      uploadToGitHub(repoOwner, repoName, filePath, graphData, commitMessage, token, sendResponse);
    }

    if (message.action === "importGraph") {
      console.log("Importing graph from GitHub...");
      importFromGitHub(repoOwner, repoName, filePath, token, sendResponse);
    }
  });

  return true; 
});

// Function to upload file to GitHub
async function uploadToGitHub(owner, repo, path, content, message, token, sendResponse) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  let sha = null;
  try {
    const fileRes = await fetch(apiUrl, {
      headers: { Authorization: `token ${token}` }
    });
    if (fileRes.ok) {
      const fileData = await fileRes.json();
      sha = fileData.sha;
    }
  } catch (err) {
    console.warn("File might not exist");
  }

  const body = JSON.stringify({
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    sha
  });

  fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json"
    },
    body
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.commit) {
        console.log("Graph successfully uploaded to GitHub:", data);
        sendResponse({ success: true, url: data.content.html_url });
      } else {
        console.error("GitHub upload failed:", data);
        sendResponse({ success: false, error: data.message });
      }
    })
    .catch((err) => {
      console.error("Error uploading to GitHub:", err);
      sendResponse({ success: false, error: err.message });
    });
}

// ✅ Function to import a file from GitHub
async function importFromGitHub(owner, repo, path, token, sendResponse) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  try {
    const response = await fetch(apiUrl, {
      headers: { Authorization: `token ${token}` }
    });

    if (!response.ok) throw new Error("GitHub fetch failed");

    const fileData = await response.json();
    const graphJson = atob(fileData.content);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "displayGraph", graphData: graphJson });
    });

    sendResponse({ success: true });
  } catch (error) {
    console.error("Error loading graph:", error);
    sendResponse({ success: false, error: error.message });
  }
}
