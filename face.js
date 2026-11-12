/* Sage's animated face: SVG with eye tracking, blinking, expressions and lip-sync. */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const svgMarkup = `
<svg viewBox="0 0 400 440" xmlns="${NS}" role="img" aria-label="Sage">
  <defs>
    <radialGradient id="skin" cx="45%" cy="38%" r="70%">
      <stop offset="0%" stop-color="#f7c9a8"/><stop offset="65%" stop-color="#e3a582"/><stop offset="100%" stop-color="#c98463"/>
    </radialGradient>
    <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4a2a3a"/><stop offset="100%" stop-color="#26131f"/>
    </linearGradient>
    <linearGradient id="sweater" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e98b8f"/><stop offset="100%" stop-color="#b85a78"/>
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffb199" stop-opacity=".55"/><stop offset="100%" stop-color="#ffb199" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="iris" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#8a6a4a"/><stop offset="70%" stop-color="#4b3222"/><stop offset="100%" stop-color="#2a1b12"/>
    </radialGradient>
    <clipPath id="mouthClip"><path id="mouthClipPath" d=""/></clipPath>
    <clipPath id="eyeClipL"><ellipse cx="148" cy="212" rx="25" ry="15"/></clipPath>
    <clipPath id="eyeClipR"><ellipse cx="252" cy="212" rx="25" ry="15"/></clipPath>
  </defs>

  <circle id="haloC" cx="200" cy="215" r="200" fill="url(#halo)"/>

  <g id="body">
    <path d="M70 440 C80 370 130 345 200 345 C270 345 320 370 330 440 Z" fill="url(#sweater)"/>
    <path d="M165 345 Q200 380 235 345" fill="none" stroke="#a24d6a" stroke-width="5" stroke-linecap="round"/>
    <path d="M172 300 L172 350 Q200 368 228 350 L228 300 Z" fill="#d79473"/>
  </g>

  <g id="head">
    <path d="M78 230 C60 120 120 52 200 52 C285 52 345 120 322 235 C318 300 330 330 310 350 C290 330 300 280 290 250 L110 250 C100 280 110 330 90 350 C70 330 82 300 78 230Z" fill="url(#hair)"/>
    <ellipse cx="86" cy="225" rx="16" ry="26" fill="#d9967a"/>
    <ellipse cx="314" cy="225" rx="16" ry="26" fill="#d9967a"/>
    <circle cx="86" cy="250" r="4" fill="#ffd27a"/><circle cx="314" cy="250" r="4" fill="#ffd27a"/>
    <ellipse cx="200" cy="215" rx="112" ry="128" fill="url(#skin)"/>
    <ellipse id="blushL" cx="128" cy="262" rx="22" ry="12" fill="#ff7f86" opacity=".28"/>
    <ellipse id="blushR" cx="272" cy="262" rx="22" ry="12" fill="#ff7f86" opacity=".28"/>
    <path d="M96 175 C100 95 160 70 205 78 C250 84 300 100 306 180 C290 130 250 112 215 118 C180 124 150 112 128 128 C110 140 100 160 96 175Z" fill="url(#hair)"/>

    <g id="browL"><path d="M120 178 Q148 164 174 176" fill="none" stroke="#3a1f2c" stroke-width="7" stroke-linecap="round"/></g>
    <g id="browR"><path d="M226 176 Q252 164 280 178" fill="none" stroke="#3a1f2c" stroke-width="7" stroke-linecap="round"/></g>

    <g id="eyeL">
      <ellipse cx="148" cy="212" rx="25" ry="15" fill="#fffaf6"/>
      <g clip-path="url(#eyeClipL)"><g id="pupilL">
        <circle cx="148" cy="212" r="12" fill="url(#iris)"/><circle cx="148" cy="212" r="5.5" fill="#120a08"/>
        <circle cx="152" cy="207" r="3" fill="#fff" opacity=".9"/>
      </g><rect id="lidL" x="118" y="190" width="60" height="0" fill="#e3a582"/></g>
      <path d="M123 210 Q148 192 173 210" fill="none" stroke="#2b1820" stroke-width="3.2" stroke-linecap="round"/>
    </g>
    <g id="eyeR">
      <ellipse cx="252" cy="212" rx="25" ry="15" fill="#fffaf6"/>
      <g clip-path="url(#eyeClipR)"><g id="pupilR">
        <circle cx="252" cy="212" r="12" fill="url(#iris)"/><circle cx="252" cy="212" r="5.5" fill="#120a08"/>
        <circle cx="256" cy="207" r="3" fill="#fff" opacity=".9"/>
      </g><rect id="lidR" x="222" y="190" width="60" height="0" fill="#e3a582"/></g>
      <path d="M227 210 Q252 192 277 210" fill="none" stroke="#2b1820" stroke-width="3.2" stroke-linecap="round"/>
    </g>

    <path d="M197 230 Q193 252 189 259 Q200 267 211 259" fill="none" stroke="#b9715a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>

    <g id="mouth">
      <path id="mouthInner" d="" fill="#5a1f2b"/>
      <g clip-path="url(#mouthClip)">
        <rect id="teeth" x="160" y="290" width="80" height="11" rx="4" fill="#fffaf3"/>
        <ellipse id="tongue" cx="200" cy="330" rx="22" ry="10" fill="#d9606f"/>
      </g>
      <path id="mouthLips" d="" fill="none" stroke="#c4566a" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round"/>
    </g>
  </g>
</svg>`;

  // viseme table: [open, wide]
  const V = {
    a: [0.85, 0.55], e: [0.45, 0.85], i: [0.35, 0.9], o: [0.7, 0.15], u: [0.45, 0.05], y: [0.35, 0.8],
    m: [0, 0.4], b: [0, 0.4], p: [0, 0.4], f: [0.12, 0.6], v: [0.12, 0.6], w: [0.3, 0.05],
    l: [0.4, 0.5], t: [0.25, 0.55], d: [0.25, 0.55], n: [0.22, 0.5], s: [0.15, 0.75], z: [0.15, 0.7],
    c: [0.25, 0.6], k: [0.3, 0.5], g: [0.3, 0.5], r: [0.3, 0.3], h: [0.45, 0.5], j: [0.3, 0.5], q: [0.35, 0.2], x: [0.25, 0.6],
  };

  const Face = {
    el: null, mood: "warm", state: "idle",
    cur: { open: 0, wide: 0.5, smile: 0.5, brow: 0, tilt: 0, lx: 0, ly: 0, blink: 0, halo: 0.4 },
    tgt: { open: 0, wide: 0.5, smile: 0.5, brow: 0, tilt: 0, lx: 0, ly: 0, blink: 0, halo: 0.4 },
    speech: null, // {text, start, msPerChar, wordStart, word, wordAt, boundary}
    mouse: { x: 0, y: 0, t: 0 },
    nextBlink: 0,

    mount(container) {
      container.innerHTML = svgMarkup;
      const $ = (id) => container.querySelector("#" + id);
      this.n = {
        head: $("head"), body: $("body"), inner: $("mouthInner"), lips: $("mouthLips"), clip: $("mouthClipPath"),
        teeth: $("teeth"), tongue: $("tongue"), pL: $("pupilL"), pR: $("pupilR"), lidL: $("lidL"), lidR: $("lidR"),
        browL: $("browL"), browR: $("browR"), halo: $("haloC"), blushL: $("blushL"), blushR: $("blushR"),
      };
      this.el = container;
      window.addEventListener("pointermove", (e) => {
        const r = container.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height * 0.48;
        this.mouse = { x: (e.clientX - cx) / (window.innerWidth / 2), y: (e.clientY - cy) / (window.innerHeight / 2), t: performance.now() };
      });
      requestAnimationFrame((t) => this.loop(t));
    },

    setState(s) { this.state = s; },

    // Lip sync: call when an utterance starts / a word boundary fires
    beginUtterance(text, rate) {
      this.speech = { text, start: performance.now(), msPerChar: 68 / (rate || 1), boundary: false, wordAt: 0, word: "" };
    },
    onWord(charIndex) {
      if (!this.speech) return;
      const rest = this.speech.text.slice(charIndex);
      const m = rest.match(/^[\w'’-]+/);
      this.speech.boundary = true;
      this.speech.word = m ? m[0].toLowerCase() : "";
      this.speech.wordAt = performance.now();
    },
    endUtterance() { this.speech = null; },

    visemeNow(now) {
      const s = this.speech;
      if (!s) return null;
      let ch;
      if (s.boundary) {
        const k = Math.floor((now - s.wordAt) / s.msPerChar);
        if (k >= s.word.length) return [0.05, 0.5];
        ch = s.word[k];
      } else {
        // fallback when the voice gives no boundary events: walk through the text at an estimated pace
        const k = Math.floor((now - s.start) / s.msPerChar);
        ch = (s.text[k] || " ").toLowerCase();
        if (k > s.text.length) return [0, 0.5];
      }
      if (!ch || /[\s.,!?;:—-]/.test(ch)) return [0.03, 0.5];
      return V[ch] || [0.3, 0.5];
    },

    loop(now) {
      const c = this.cur, t = this.tgt, n = this.n;
      // gaze: follow pointer recently moved, otherwise gently look at the user with micro-saccades
      const recent = now - this.mouse.t < 2500;
      let gx = recent ? this.mouse.x : Math.sin(now / 2300) * 0.12;
      let gy = recent ? this.mouse.y : Math.cos(now / 3100) * 0.08;
      if (this.state === "thinking") { gx = 0.55; gy = -0.6; }
      t.lx = Math.max(-1, Math.min(1, gx)) * 9;
      t.ly = Math.max(-1, Math.min(1, gy)) * 5;

      // expression by state
      const st = this.state;
      t.smile = st === "speaking" ? 0.45 : st === "listening" ? 0.4 : st === "thinking" ? 0.15 : 0.55;
      t.brow = st === "listening" ? 5 : st === "thinking" ? -3 : st === "speaking" ? 2 + Math.sin(now / 420) * 2 : 0;
      t.tilt = st === "listening" ? 5 : st === "thinking" ? -3 : Math.sin(now / 1900) * 1.5;
      t.halo = st === "listening" ? 0.75 + Math.sin(now / 220) * 0.15 : st === "speaking" ? 0.6 : 0.38;

      const vis = this.visemeNow(now);
      if (vis) { t.open = vis[0]; t.wide = vis[1]; } else { t.open = 0; t.wide = 0.5; }

      // blinking
      if (now > this.nextBlink) { this.blinkStart = now; this.nextBlink = now + 2200 + Math.random() * 3800; }
      const bt = now - (this.blinkStart || -1e9);
      t.blink = bt < 70 ? bt / 70 : bt < 150 ? 1 - (bt - 70) / 80 : 0;

      const ease = (k, f) => { c[k] += (t[k] - c[k]) * f; };
      ease("open", 0.38); ease("wide", 0.3); ease("smile", 0.08); ease("brow", 0.1); ease("tilt", 0.06);
      ease("lx", 0.14); ease("ly", 0.14); ease("halo", 0.08); c.blink = t.blink;

      // render
      const bob = this.state === "speaking" ? Math.sin(now / 260) * 1.6 : Math.sin(now / 1400) * 1.2;
      n.head.setAttribute("transform", `rotate(${c.tilt.toFixed(2)} 200 300) translate(0 ${bob.toFixed(2)})`);
      n.pL.setAttribute("transform", `translate(${c.lx.toFixed(2)} ${c.ly.toFixed(2)})`);
      n.pR.setAttribute("transform", `translate(${c.lx.toFixed(2)} ${c.ly.toFixed(2)})`);
      const lidH = c.blink * 34;
      n.lidL.setAttribute("height", lidH.toFixed(1)); n.lidR.setAttribute("height", lidH.toFixed(1));
      n.browL.setAttribute("transform", `translate(0 ${(-c.brow).toFixed(2)})`);
      n.browR.setAttribute("transform", `translate(0 ${(-c.brow).toFixed(2)})`);
      n.halo.setAttribute("opacity", c.halo.toFixed(2));
      const blush = (0.22 + c.smile * 0.15).toFixed(2);
      n.blushL.setAttribute("opacity", blush); n.blushR.setAttribute("opacity", blush);

      const d = mouthPath(c.open, c.wide, c.smile);
      n.inner.setAttribute("d", d); n.lips.setAttribute("d", d); n.clip.setAttribute("d", d);
      n.teeth.setAttribute("y", (299 - c.smile * 6 - 2).toFixed(1));
      n.tongue.setAttribute("cy", (308 + c.open * 26).toFixed(1));

      requestAnimationFrame((tt) => this.loop(tt));
    },
  };

  function mouthPath(open, wide, smile) {
    const cx = 200, cy = 303;
    const hw = 26 + wide * 18 + smile * 6;
    const cornerY = cy - smile * 9;
    const topY = cy - 1 - open * 6 + smile * 2;
    const botY = cy + 3 + open * 34 + smile * 6;
    const L = cx - hw, R = cx + hw;
    return `M ${L.toFixed(1)} ${cornerY.toFixed(1)} C ${(cx - hw * 0.5).toFixed(1)} ${topY.toFixed(1)} ${(cx + hw * 0.5).toFixed(1)} ${topY.toFixed(1)} ${R.toFixed(1)} ${cornerY.toFixed(1)} C ${(cx + hw * 0.55).toFixed(1)} ${botY.toFixed(1)} ${(cx - hw * 0.55).toFixed(1)} ${botY.toFixed(1)} ${L.toFixed(1)} ${cornerY.toFixed(1)} Z`;
  }

  window.Face = Face;
})();
