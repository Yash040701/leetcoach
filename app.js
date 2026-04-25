// Replace with your actual HF Space URL
const HF_API = "https://Yash0407-leetcoach.hf.space/run/predict";

function addMessage(role, text) {
  const chat = document.getElementById("chat");
  const div = document.createElement("div");
  div.className = "message " + role;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById("input");
  const btn = document.getElementById("send-btn");
  const problem = input.value.trim();
  if (!problem) return;

  addMessage("user", problem);
  input.value = "";
  btn.disabled = true;
  btn.textContent = "Thinking...";
  addMessage("assistant", "⏳ LeetCoach is thinking...");

  try {
    const res = await fetch(HF_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [problem] })
    });
    const data = await res.json();
    // remove the "thinking" placeholder
    const chat = document.getElementById("chat");
    chat.removeChild(chat.lastChild);
    addMessage("assistant", data.data[0]);
  } catch (err) {
    const chat = document.getElementById("chat");
    chat.removeChild(chat.lastChild);
    addMessage("assistant", "Error reaching LeetCoach. Is the Space awake? Try again in 30s.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Get Hint";
  }
}

document.getElementById("input").addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
