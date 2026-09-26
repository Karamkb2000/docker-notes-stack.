const notesEl = document.getElementById("notes");
const notesStatus = document.getElementById("notes-status");
const statNotes = document.getElementById("stat-notes");
const statTicks = document.getElementById("stat-ticks");
const badge = document.getElementById("api-badge");
const form = document.getElementById("note-form");
const input = document.getElementById("note-input");

function setBadge(up) {
  badge.className = "badge " + (up ? "up" : "down");
  badge.innerHTML = '<span class="dot"></span> ' + (up ? "api online" : "api offline");
}

function renderNotes(notes) {
  if (!notes.length) {
    notesEl.innerHTML = '<p class="muted">No notes yet — add your first one above.</p>';
    return;
  }
  notesEl.innerHTML = notes
    .map((n) => '<div class="note"><span class="hash">#' + n.id + '</span><span>' + escapeHtml(n.text) + "</span></div>")
    .join("");
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function loadNotes() {
  try {
    const res = await fetch("/api/notes");
    if (!res.ok) throw new Error("HTTP " + res.status);
    renderNotes(await res.json());
    setBadge(true);
  } catch (err) {
    notesEl.innerHTML = '<p class="error">Could not load notes (' + err.message + ").</p>";
    setBadge(false);
  }
}

async function loadStats() {
  try {
    const res = await fetch("/api/stats");
    const s = await res.json();
    statNotes.textContent = s.notesCreated;
    statTicks.textContent = s.workerTicks;
    setBadge(true);
  } catch {
    setBadge(false);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  await loadNotes();
  await loadStats();
});

loadNotes();
loadStats();
setInterval(loadStats, 5000);
