/* Kindred app wiring: voice in (SpeechRecognition), voice out (speechSynthesis), chat, tabs, settings. */
(function () {
  const $ = (s) => document.querySelector(s);
  const chat = $("#chat"), caption = $("#caption"), statusEl = $("#status"), statusText = $("#statusText");
  const micBtn = $("#micBtn"), micLabel = $("#micLabel"), handsFree = $("#handsFree");
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };

  Face.mount($("#face"));

  let view = "talk", started = false, listening = false, speaking = false, muted = store.get("kindred_muted", "0") === "1";
  let labMounted = false, lastAction = null;

  function setStatus(s, text) {
    statusEl.className = "status " + s;
    statusText.textContent = text;
    Face.setState(s === "idle" ? "idle" : s);
  }

  // ---------- Voice out ----------
  const synth = window.speechSynthesis;
  let voices = [], speakToken = 0;
  const PREFERRED = ["Samantha", "Ava", "Allison", "Serena", "Karen", "Moira", "Google UK English Female", "Microsoft Aria", "Microsoft Jenny", "Google US English", "Daniel"];
  function loadVoices() {
    if (!synth) return;
    voices = synth.getVoices().filter((v) => /^en/i.test(v.lang));
    const sel = $("#voiceSel");
    const saved = store.get("kindred_voice", "");
    sel.innerHTML = voices.map((v) => `<option value="${v.name}">${v.name} (${v.lang})</option>`).join("") || "<option>Default voice</option>";
    const best = voices.find((v) => v.name === saved) || PREFERRED.map((p) => voices.find((v) => v.name.includes(p))).find(Boolean) || voices[0];
    if (best) sel.value = best.name;
  }
  if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }
  const currentVoice = () => voices.find((v) => v.name === $("#voiceSel").value);
  const rate = () => +$("#rateIn").value;

  function sentences(text) {
    return (text.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) || [text]).map((s) => s.trim()).filter(Boolean);
  }

  function speak(text) {
    stopListening();
    const token = ++speakToken;
    if (synth) synth.cancel();
    const parts = sentences(text);
    speaking = true;
    setStatus("speaking", "Sage is speaking…");
    let i = 0;
    const next = () => {
      if (token !== speakToken) return;
      if (i >= parts.length) return done();
      const s = parts[i++];
      caption.textContent = s;
      if (muted || !synth) {
        Face.beginUtterance(s, 1);
        setTimeout(() => { Face.endUtterance(); next(); }, Math.max(900, s.length * 62));
        return;
      }
      const u = new SpeechSynthesisUtterance(s);
      const v = currentVoice(); if (v) u.voice = v;
      u.rate = rate(); u.pitch = 1.02;
      let ended = false;
      const fin = () => { if (ended) return; ended = true; clearTimeout(guard); Face.endUtterance(); setTimeout(next, 120); };
      const guard = setTimeout(fin, s.length * 95 / rate() + 4000); // some browsers drop onend
      u.onstart = () => Face.beginUtterance(s, rate());
      u.onboundary = (e) => { if (e.name === "word" || e.name === undefined) Face.onWord(e.charIndex); };
      u.onend = fin; u.onerror = fin;
      synth.speak(u);
    };
    const done = () => {
      speaking = false;
      setStatus("idle", started ? "Your turn" : "Tap “Begin” to start");
      updateMic();
      if (started && handsFree.checked && wantsAutoListen()) setTimeout(() => { if (!speaking) startListening(); }, 350);
    };
    next();
  }
  function stopSpeaking() { speakToken++; if (synth) synth.cancel(); Face.endUtterance(); speaking = false; }

  function wantsAutoListen() {
    if (view === "talk") return true;
    return labMounted && Lab.i >= 0 && document.querySelector("#openIn");
  }

  // ---------- Voice in ----------
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null, gotFinal = false;
  if (SR) {
    rec = new SR();
    rec.lang = navigator.language && /^en/i.test(navigator.language) ? navigator.language : "en-US";
    rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      let interim = "", final = "";
      for (let k = e.resultIndex; k < e.results.length; k++) {
        const r = e.results[k];
        if (r.isFinal) final += r[0].transcript; else interim += r[0].transcript;
      }
      if (interim) caption.innerHTML = `<span class="interim">${interim.replace(/[<>&]/g, "")}</span>`;
      if (final.trim()) { gotFinal = true; listening = false; updateMic(); onUserText(final.trim()); }
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        listening = false; updateMic();
        setStatus("idle", "Microphone blocked. Allow mic access, or type below.");
      }
    };
    rec.onend = () => {
      const wasListening = listening;
      listening = false;
      if (!gotFinal && wasListening && started && handsFree.checked && !speaking) {
        // nothing heard — keep the conversation open
        setTimeout(() => { if (!speaking && !listening) startListening(); }, 250);
        return;
      }
      if (!speaking && statusEl.classList.contains("listening")) setStatus("idle", "Your turn");
      updateMic();
    };
  }

  function startListening() {
    if (!rec) { setStatus("idle", "Voice input isn't supported in this browser. Try Chrome, Edge or Safari, or type below."); return; }
    if (listening) return;
    if (speaking) stopSpeaking();
    gotFinal = false;
    try { rec.start(); listening = true; setStatus("listening", "Listening… just talk"); caption.textContent = ""; }
    catch { /* already started */ }
    updateMic();
  }
  function stopListening() { if (rec && listening) { listening = false; try { rec.abort(); } catch {} } updateMic(); }

  function updateMic() {
    micBtn.classList.toggle("on", listening);
    micLabel.textContent = !started ? "Begin" : listening ? "Listening… tap to pause" : speaking ? "Tap to interrupt" : "Tap to talk";
  }

  micBtn.onclick = () => {
    if (!started) {
      started = true;
      if (view === "talk") greet(); else speak("Welcome to the lab. Take your time with each question.");
      return;
    }
    if (listening) { stopListening(); setStatus("idle", "Paused. Tap to talk"); }
    else startListening();
  };

  $("#muteBtn").onclick = () => {
    muted = !muted; store.set("kindred_muted", muted ? "1" : "0");
    $("#muteBtn").textContent = muted ? "🔇 Voice off" : "🔊 Voice on";
    if (muted && synth) synth.cancel();
  };
  $("#muteBtn").textContent = muted ? "🔇 Voice off" : "🔊 Voice on";

  // ---------- Chat ----------
  function addMsg(who, text, opts = {}) {
    const d = document.createElement("div");
    d.className = "msg " + who;
    d.innerHTML = `<div class="who">${who === "sage" ? "Sage" : "You"}</div><div class="body"></div>`;
    d.querySelector(".body").textContent = text;
    if (opts.cite && opts.cite.length) {
      const c = document.createElement("span"); c.className = "cite";
      c.textContent = "🔬 " + window.cite(...opts.cite);
      c.title = opts.cite.map((k) => window.REFS[k]).join("\n\n");
      d.appendChild(c);
    }
    if (opts.action === "lab") {
      const b = document.createElement("div"); b.className = "act";
      b.innerHTML = `<button class="primary small">Open the Ideal Partner Lab →</button>`;
      b.querySelector("button").onclick = () => switchView("lab");
      d.appendChild(b);
    }
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
    return d;
  }
  function typing() {
    const d = document.createElement("div");
    d.className = "msg sage typing";
    d.innerHTML = `<span></span><span></span><span></span>`;
    chat.appendChild(d); chat.scrollTop = chat.scrollHeight;
    return d;
  }

  function greet() {
    const hasLab = !!store.get("kindred_lab", "");
    const t = `Hi, I'm Sage. I'm a relationship coach, and I lean on real research about what makes love healthy and lasting. You can talk to me about anything: dating, a hard conversation, a breakup, or figuring out who's right for you. ${hasLab ? "Welcome back, by the way. " : ""}What's on your mind?`;
    addMsg("sage", t);
    speak(t);
  }

  async function onUserText(text) {
    if (view === "lab" && labMounted && Lab.dictate(text)) {
      caption.textContent = "Got it. Add more, or press Next.";
      setStatus("idle", "Added to your answer");
      return;
    }
    if (view !== "talk") switchView("talk");
    addMsg("you", text);
    $("#chips").classList.add("hidden");
    caption.textContent = "";
    if (lastAction === "lab" && /^(yes|yeah|yep|sure|ok(ay)?|let'?s|start|please|definitely|absolutely)\b/i.test(text)) {
      lastAction = null;
      const t = "Wonderful. Let's head into the lab.";
      addMsg("sage", t); speak(t);
      setTimeout(() => switchView("lab"), 1200);
      return;
    }
    stopListening();
    setStatus("thinking", "Sage is thinking…");
    const tdot = typing();
    const t0 = performance.now();
    let out, note = "";
    try {
      // Safety topics always use the local, vetted responses first.
      const local = LocalBrain.respond(text);
      const safety = /988|Hotline/.test(local.text);
      if (ClaudeBrain.available() && !safety) {
        try { out = await ClaudeBrain.respond(text); if (local.action) out.action = local.action; }
        catch (e) { ClaudeBrain.history.pop(); out = local; note = e.message; }
      } else out = local;
    } catch (e) { out = { text: "Sorry, I lost my train of thought. Could you say that again?" }; }
    const wait = 700 - (performance.now() - t0);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    tdot.remove();
    if (note) console.warn("Claude unavailable, using built-in coach:", note);
    lastAction = out.action || null;
    addMsg("sage", out.text, out);
    speak(out.text);
  }

  $("#composer").onsubmit = (e) => {
    e.preventDefault();
    const v = $("#textIn").value.trim();
    if (!v) return;
    $("#textIn").value = "";
    if (!started) started = true;
    onUserText(v);
  };
  document.querySelectorAll(".chip").forEach((c) => c.onclick = () => { if (!started) started = true; onUserText(c.textContent); });

  // ---------- Tabs ----------
  function switchView(v) {
    view = v;
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === v));
    $("#view-talk").classList.toggle("hidden", v !== "talk");
    $("#view-lab").classList.toggle("hidden", v !== "lab");
    stopListening();
    if (v === "lab" && !labMounted) {
      labMounted = true;
      Lab.mount($("#lab"), (t) => { if (started) speak(t); else caption.textContent = sentences(t)[0]; });
      if (started) speak("Welcome to the Ideal Partner Lab. I'll ask you some questions that relationship science says actually matter. There are no right answers, just honest ones.");
    }
  }
  document.querySelectorAll(".tab").forEach((t) => t.onclick = () => switchView(t.dataset.view));

  // ---------- Settings ----------
  const dlg = $("#settings");
  const brainState = () => { $("#brainState").textContent = ClaudeBrain.available() ? "✓ Claude connected" : "Using built-in coach"; };
  $("#settingsBtn").onclick = () => { $("#keyIn").value = store.get("kindred_key", ""); $("#rateIn").value = store.get("kindred_rate", "1"); brainState(); dlg.showModal(); };
  $("#clearKey").onclick = () => { store.del("kindred_key"); $("#keyIn").value = ""; ClaudeBrain.history = []; brainState(); };
  dlg.addEventListener("close", () => {
    const k = $("#keyIn").value.trim();
    if (k) store.set("kindred_key", k); else store.del("kindred_key");
    store.set("kindred_voice", $("#voiceSel").value);
    store.set("kindred_rate", $("#rateIn").value);
  });
  $("#rateIn").value = store.get("kindred_rate", "1");

  // Opening caption
  caption.textContent = "Hi, I'm Sage. Press Begin and we can talk, out loud.";
  addMsg("sage", "Hi, I'm Sage, your relationship coach. Press Begin to talk out loud, or type below. Everything I suggest is grounded in relationship science, and I'll show you the sources.");
  updateMic();
})();
