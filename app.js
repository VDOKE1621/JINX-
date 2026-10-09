(() => {
  const $ = (id) => document.getElementById(id);
  let apiKey = "";
  let useGrounding = true;
  let lastQuery = "";
  const form = $("searchForm"), query = $("query"), button = $("searchButton");
  const modal = $("settingsModal");

  function openSettings() { modal.classList.remove("hidden"); $("apiKey").value = apiKey; $("groundingToggle").checked = useGrounding; }
  function closeSettings() { modal.classList.add("hidden"); }
  $("settingsOpen").addEventListener("click", openSettings);
  $("settingsClose").addEventListener("click", closeSettings);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeSettings(); });
  $("saveSettings").addEventListener("click", () => {
    apiKey = $("apiKey").value.trim();
    useGrounding = $("groundingToggle").checked;
    $("settingsMessage").textContent = apiKey ? "Key is ready for this browser session." : "Paste a key first to enable AI answers.";
    if (apiKey) setTimeout(closeSettings, 650);
  });
  $("removeKey").addEventListener("click", () => {
    apiKey = ""; $("apiKey").value = ""; $("settingsMessage").textContent = "Key forgotten.";
  });

  document.querySelectorAll(".suggestion").forEach((b) => b.addEventListener("click", () => {
    query.value = b.dataset.query; runSearch();
  }));
  $("clearButton").addEventListener("click", () => {
    $("answerArea").classList.add("hidden"); $("status").textContent = "";
    query.value = ""; query.focus();
  });
  $("copyButton").addEventListener("click", async () => {
    const text = $("answer").innerText;
    try { await navigator.clipboard.writeText(text); $("copyButton").textContent = "Copied ✓"; }
    catch { $("copyButton").textContent = "Select and copy the answer"; }
    setTimeout(() => $("copyButton").textContent = "Copy answer", 1600);
  });
  $("webButton").addEventListener("click", () => {
    if (lastQuery) window.open("https://www.google.com/search?q=" + encodeURIComponent(lastQuery), "_blank", "noopener,noreferrer");
  });
  form.addEventListener("submit", (e) => { e.preventDefault(); runSearch(); });

  function setStatus(msg) { $("status").textContent = msg; }
  function safeText(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function showAnswer(text, sources) {
    $("answer").textContent = text;
    const area = $("sources"), wrap = $("sourcesWrap");
    area.innerHTML = "";
    if (sources.length) {
      sources.forEach((s) => {
        const a = document.createElement("a");
        a.className = "source"; a.href = s.uri; a.target = "_blank"; a.rel = "noopener noreferrer";
        const title = document.createElement("strong"); title.textContent = s.title || s.uri;
        const url = document.createElement("span"); url.textContent = s.uri;
        a.append(title, url); area.appendChild(a);
      });
      wrap.classList.remove("hidden");
    } else wrap.classList.add("hidden");
    $("answerMeta").textContent = new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}) + " · Check important facts in the sources";
    $("answerArea").classList.remove("hidden");
    $("answerArea").scrollIntoView({behavior:"smooth", block:"start"});
  }

  async function runSearch() {
    const q = query.value.trim();
    if (!q) return;
    lastQuery = q;
    $("answerArea").classList.add("hidden");
    button.disabled = true; button.innerHTML = '<span>Searching…</span><span class="arrow">⟳</span>';
    setStatus(apiKey ? "JINX is researching your question…" : "AI is not connected yet. Opening web search…");
    if (!apiKey) {
      window.open("https://www.google.com/search?q=" + encodeURIComponent(q), "_blank", "noopener,noreferrer");
      setStatus("Opened web results in a new tab. To enable AI answers, open ⚙ and add a Gemini API key.");
      button.disabled = false; button.innerHTML = '<span>Search</span><span class="arrow">↗</span>';
      return;
    }
    try {
      const body = {
        contents: [{ role: "user", parts: [{ text:
          "You are JINX, a helpful AI search assistant. Answer the user's question clearly and accurately. " +
          "Use concise headings or bullets where helpful. Distinguish confirmed facts from uncertainty. " +
          "If the user asks for current facts, use web search if available and cite sources. Question: " + q
        }]}],
        generationConfig: { temperature: 0.35, maxOutputTokens: 1800 }
      };
      if (useGrounding) body.tools = [{ google_search: {} }];
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(apiKey), {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) {
        const detail = data?.error?.message || "The AI request failed.";
        throw new Error(detail);
      }
      const candidate = data.candidates?.[0];
      const answer = (candidate?.content?.parts || []).map(p => p.text || "").filter(Boolean).join("\n\n");
      if (!answer) throw new Error("JINX did not receive an answer. Try again.");
      const sources = [];
      const chunks = candidate?.groundingMetadata?.groundingChunks || [];
      chunks.forEach((chunk) => {
        const web = chunk.web;
        if (web?.uri && !sources.some(s => s.uri === web.uri)) sources.push({uri:web.uri, title:web.title || web.uri});
      });
      showAnswer(answer, sources);
      setStatus("");
    } catch (err) {
      setStatus("Could not complete the AI search.");
      $("answer").textContent = "JINX couldn't complete this request.\n\n" + err.message + "\n\nCheck your API key, internet connection, and API access in Google AI Studio. You can still open normal web results.";
      $("sourcesWrap").classList.add("hidden"); $("answerArea").classList.remove("hidden");
    } finally {
      button.disabled = false; button.innerHTML = '<span>Search</span><span class="arrow">↗</span>';
    }
  }
})();