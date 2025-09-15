const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const resumePreview = document.getElementById("resume-preview");
const togglePreviewBtn = document.getElementById("toggle-preview-btn");
const resumePanel = document.getElementById("resume-panel");

const MCP_URL = "http://localhost:8000/mcp/tools/resume_agent";
const session_id = crypto.randomUUID(); // unique session per user

// Toggle Resume Preview
togglePreviewBtn.addEventListener("click", () => {
  if (resumePanel.style.display === "none") {
    resumePanel.style.display = "block";
    togglePreviewBtn.textContent = "Hide Resume Preview";
  } else {
    resumePanel.style.display = "none";
    togglePreviewBtn.textContent = "Show Resume Preview";
  }
});

// Send user query
sendBtn.addEventListener("click", async () => {
  const query = userInput.value.trim();
  if (!query) return;

  appendMessage(query, "user-msg");
  userInput.value = "";

  try {
    const response = await fetch(MCP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, session_id })
    });
    const data = await response.json();
    const result = data.result || "No response";

    appendMessage(result, "bot-msg");
    updateResumePreview(result);

    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    appendMessage("Error: Could not reach server.", "bot-msg");
  }
});

function appendMessage(message, className) {
  const div = document.createElement("div");
  div.className = `chat-msg ${className}`;
  if (className === "bot-msg") {
    div.innerHTML = marked.parse(message);
  } else {
    div.textContent = message;
  }
  chatBox.appendChild(div);
}

function updateResumePreview(text) {
  resumePreview.innerHTML = marked.parse(text);
}
