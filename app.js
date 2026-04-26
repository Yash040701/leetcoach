// Replace with your actual HF Space URL
const HF_API = "https://yash0407-leetcoach.hf.space/call/predict";

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
    // Step 1 — submit the request, get an event_id back
    const submitRes = await fetch(HF_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [problem] })
    });
    const { event_id } = await submitRes.json();

    // Step 2 — poll the result using that event_id
    const resultRes = await fetch(
      `https://yash0407-leetcoach.hf.space/call/predict/${event_id}`
    );
    const text = await resultRes.text();

    // Parse the SSE response — result line starts with "data: "
    const line = text.split("\n").find(l => l.startsWith("data:"));
    const data = JSON.parse(line.replace("data: ", ""));

    const chat = document.getElementById("chat");
    chat.removeChild(chat.lastChild);
    addMessage("assistant", data[0]);

  } catch (err) {
    const chat = document.getElementById("chat");
    chat.removeChild(chat.lastChild);
    addMessage("assistant", "Error reaching LeetCoach. Space may be waking up — try again in 30s.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Get Hint";
  }
}
document.getElementById("input").addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
