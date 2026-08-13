// app.js
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const translateBtn = document.getElementById("translateBtn");
const swapBtn = document.getElementById("swapBtn");
const fromLabel = document.getElementById("fromLabel");
const toLabel = document.getElementById("toLabel");
const statusEl = document.getElementById("status");

const defEn = document.getElementById("defEn");
const defGl = document.getElementById("defGl");
const defPos = document.getElementById("defPos");
const defBtn = document.getElementById("defBtn");
const defStatus = document.getElementById("defStatus");

let direction = "en2gl"; // or "gl2en"

function apiUrl(path) {
  if (!GLOBLISH_WORKER_URL || GLOBLISH_WORKER_URL.includes("YOUR-SUBDOMAIN")) {
    return null;
  }
  return GLOBLISH_WORKER_URL.replace(/\/$/, "") + path;
}

async function translate() {
  const text = inputText.value.trim();
  if (!text) return;

  const url = apiUrl("/api/translate");
  if (!url) {
    statusEl.textContent = "⚠️ Set GLOBLISH_WORKER_URL in config.js first.";
    return;
  }

  translateBtn.disabled = true;
  statusEl.textContent = "Translating...";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, direction }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unknown error");
    outputText.value = data.translated;
    statusEl.textContent = "";
  } catch (err) {
    statusEl.textContent = "⚠️ " + err.message;
  } finally {
    translateBtn.disabled = false;
  }
}

function swap() {
  direction = direction === "en2gl" ? "gl2en" : "en2gl";
  const isEnToGl = direction === "en2gl";
  fromLabel.textContent = isEnToGl ? "English" : "Globlish";
  toLabel.textContent = isEnToGl ? "Globlish" : "English";
  inputText.placeholder = isEnToGl ? "Type English here..." : "Type Globlish here...";

  // Move any existing output into the input so users can flip and refine.
  const oldOutput = outputText.value;
  inputText.value = oldOutput || inputText.value;
  outputText.value = "";
}

async function saveDefinition() {
  const en = defEn.value.trim();
  const gl = defGl.value.trim();
  const pos = defPos.value;
  if (!en || !gl) {
    defStatus.textContent = "Enter both an English and Globlish word.";
    return;
  }
  const url = apiUrl("/api/define");
  if (!url) {
    defStatus.textContent = "⚠️ Set GLOBLISH_WORKER_URL in config.js first.";
    return;
  }
  defBtn.disabled = true;
  defStatus.textContent = "Saving...";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ en, gl, pos }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unknown error");
    defStatus.textContent = `Saved: ${en} ↔ ${gl}`;
    defEn.value = "";
    defGl.value = "";
  } catch (err) {
    defStatus.textContent = "⚠️ " + err.message;
  } finally {
    defBtn.disabled = false;
  }
}

translateBtn.addEventListener("click", translate);
inputText.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) translate();
});
swapBtn.addEventListener("click", swap);
defBtn.addEventListener("click", saveDefinition);
