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

  const chat = document.getElementById("chat");
  const BASE = "https://yash0407-leetcoach.hf.space/gradio_api";

  // random session hash
  const session_hash = Math.random().toString(36).slice(2);

  try {
    // Step 1 — join the queue
    const joinRes = await fetch(`${BASE}/queue/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [problem],
        fn_index: 0,
        session_hash
      })
    });
    if (!joinRes.ok) throw new Error(`Queue join failed: ${joinRes.status}`);

    // Step 2 — listen to the SSE stream for the result
    const result = await new Promise((resolve, reject) => {
      const stream = new EventSource(
        `${BASE}/queue/data?session_hash=${session_hash}`
      );
      stream.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.msg === "process_completed") {
          stream.close();
          resolve(msg.output?.data?.[0]);
        } else if (msg.msg === "queue_full") {
          stream.close();
          reject(new Error("Queue full — try again in a moment."));
        }
      };
      stream.onerror = () => {
        stream.close();
        reject(new Error("Stream error — Space may be waking up."));
      };
    });

    chat.removeChild(chat.lastChild);
    addMessage("assistant", result);

  } catch (err) {
    chat.removeChild(chat.lastChild);
    addMessage("assistant", "⚠️ " + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Get Hint";
  }
}

document.getElementById("input").addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
