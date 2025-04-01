const GITHUB_TOKEN = "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"; 

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ githubToken: GITHUB_TOKEN }, () => {
    console.log("GitHub token stored!");
  });
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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  chrome.storage.local.get("githubToken", async (result) => {
    const token = result.githubToken;
    if (!token) {
      sendResponse({ success: false, error: "GitHub token not found." });
      return;
    }

    const repoOwner = "SamE-345";
    const repoName = "Desmos_Graph_Exporter";

    if (message.action === "exportGraph") {
      const filePath = "Desmos/graph.json";
      uploadToGitHub(repoOwner, repoName, filePath, JSON.stringify(message.data, null, 2), "Auto-exported Desmos graph", token, sendResponse);
    }

    if (message.action === "importGraph") {
      console.log("📥 Importing graph from GitHub:", message.filename);

        const repoOwner = "SamE-345";
        const repoName = "Desmos_Graph_Exporter";
        const filePath = `Desmos/${message.filename}`; // User-defined filename

        chrome.storage.local.get("githubToken", (result) => {
            const token = result.githubToken;
            if (!token) {
                console.error("❌ GitHub token missing!");
                sendResponse({ success: false, error: "GitHub token not found." });
                return;
            }
          })
          importFromGitHub(repoOwner, repoName, filePath, token, sendResponse);
    }
  });
  return true;
})

async function importFromGitHub(owner, repo, path, token, sendResponse) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  try {
      const response = await fetch(apiUrl, {
          headers: { Authorization: `token ${token}` }
      });

      if (!response.ok) {
          throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const fileData = await response.json();
      const content = atob(fileData.content); // Decode base64 content

      console.log("✅ Graph imported from GitHub:", content);
      sendResponse({ success: true, data: JSON.parse(content) });
  } catch (error) {
      console.error("❌ Error importing from GitHub:", error);
      sendResponse({ success: false, error: error.message });
  }
}
