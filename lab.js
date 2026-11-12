/* Ideal Partner Lab: guided deep questions -> evidence-based partner profile. */
(function () {
  const Q = [
    // Module 1: attachment (dimensional, items paraphrased in the spirit of ECR-R)
    { id: "a1", mod: "How you attach", type: "scale", dim: "anx",
      text: "I worry that the people I love won't care about me as much as I care about them.",
      why: "Attachment anxiety and avoidance are two of the strongest individual predictors of relationship quality in a 43-study analysis (Joel et al., 2020)." },
    { id: "v1", mod: "How you attach", type: "scale", dim: "avo",
      text: "I get uncomfortable when a partner wants to be very close to me." },
    { id: "a2", mod: "How you attach", type: "scale", dim: "anx",
      text: "When someone I'm dating goes quiet, my mind jumps to the worst." },
    { id: "v2", mod: "How you attach", type: "scale", dim: "avo",
      text: "I prefer not to depend on a partner, or have them depend on me." },
    { id: "a3", mod: "How you attach", type: "scale", dim: "anx",
      text: "I need a lot of reassurance that I'm loved." },
    { id: "v3", mod: "How you attach", type: "scale", dim: "avo", reverse: true,
      text: "I find it easy to share my private thoughts and feelings with a partner." },

    // Module 2: you
    { id: "w1", mod: "Your foundation", type: "scale", dim: "well",
      text: "Overall, I'm satisfied with my life right now.",
      why: "Your own life satisfaction and emotional state predict relationship quality, not just who you pick (Joel et al., 2020). Healthy love starts with you." },
    { id: "w2", mod: "Your foundation", type: "scale", dim: "well",
      text: "When I'm upset, I can usually calm myself down." },
    { id: "g1", mod: "Your foundation", type: "scale", dim: "growth",
      text: "A great relationship is something two people build and grow into over time.",
      why: "People with 'growth beliefs' handle conflict better; strong 'destiny beliefs' are linked to giving up when things get hard (Knee, 1998)." },
    { id: "d1", mod: "Your foundation", type: "scale", dim: "destiny",
      text: "If a relationship is meant to be, it should feel easy right from the start." },

    // Module 3: values
    { id: "values", mod: "What you value", type: "multi", max: 3,
      text: "Pick the three values that feel most central to the life you want.",
      why: "Similarity in core values relates to satisfaction more reliably than similarity in personality or hobbies (Gaunt, 2006; Montoya et al., 2008).",
      opts: ["Family", "Adventure", "Achievement & ambition", "Security & stability", "Faith & spirituality", "Creativity", "Service & kindness to others", "Independence & freedom", "Tradition & culture", "Learning & growth", "Health & wellbeing", "Fun & play"] },
    { id: "deal", mod: "What you value", type: "multi", max: 6,
      text: "Which of these are truly non-negotiable for you? (Choose any that apply.)",
      why: "Life-goal mismatches (kids, faith, location, monogamy) are a common reason committed couples part. Know yours early.",
      opts: ["I want children", "I don't want children", "Shared faith or religion", "Strict monogamy", "Open to non-monogamy", "Living near my family", "Willing to relocate", "A substance-free lifestyle", "Similar views on money", "Similar political values", "None of these"] },

    // Module 4: how you love
    { id: "conflict", mod: "How you love", type: "single",
      text: "When there's tension with someone you love, you usually…",
      why: "Gottman found three stable conflict styles: validating, volatile, and avoiding. Each can work. What predicts breakup is contempt, criticism, defensiveness and stonewalling (Gottman, 1994).",
      opts: [
        { v: "volatile", t: "Talk it out right away, even if it gets heated" },
        { v: "validating", t: "Calmly discuss it and try to understand each other" },
        { v: "avoiding", t: "Let it pass, since most things aren't worth fighting about" },
        { v: "stonewall", t: "Shut down or go quiet until it blows over" },
        { v: "critical", t: "Get critical or sarcastic, then regret it" },
      ] },
    { id: "together", mod: "How you love", type: "scale", lo: "Lots of independence", hi: "Doing almost everything together",
      text: "Your ideal balance of togetherness and independence." },
    { id: "social", mod: "How you love", type: "scale", lo: "Quiet nights in", hi: "Always out with people",
      text: "Your social energy." },
    { id: "novel", mod: "How you love", type: "scale", lo: "Comforting routine", hi: "Constant new adventures",
      text: "How much do you crave novelty and new experiences?",
      why: "Doing new, exciting things together boosts relationship quality (Aron et al., 2000). Big differences in appetite for novelty are worth talking about." },

    // Module 5: the checklist
    { id: "looks", mod: "Your checklist", type: "scale", lo: "Not important", hi: "Essential",
      text: "How important is it that a partner is very physically attractive?",
      why: "In speed-dating and meta-analyses, the traits people say they want in advance barely predict who they actually desire or stay happy with (Eastwick & Finkel, 2008; Eastwick et al., 2014)." },
    { id: "money", mod: "Your checklist", type: "scale", lo: "Not important", hi: "Essential",
      text: "How important is it that a partner earns a lot or is highly ambitious?" },
    { id: "kind", mod: "Your checklist", type: "scale", lo: "Not important", hi: "Essential",
      text: "How important is it that a partner is kind and understanding?",
      why: "Kindness was rated among the most desired traits by both sexes in 37 cultures (Buss, 1989), and partner agreeableness predicts satisfaction (Malouff et al., 2010)." },

    // Module 6: deep questions
    { id: "past", mod: "Going deeper", type: "open",
      text: "Think of someone you were strongly drawn to who wasn't good for you. What pulled you in, and what did it cost you?",
      why: "Patterns repeat. Naming what felt like 'chemistry' helps you notice it next time, and ask whether it's attraction or familiarity." },
    { id: "understood", mod: "Going deeper", type: "open",
      text: "Describe a moment you felt truly understood by someone. What exactly did they do or say?",
      why: "Feeling understood, validated and cared for, perceived partner responsiveness, is a core engine of intimacy (Reis et al., 2004)." },
    { id: "bringout", mod: "Going deeper", type: "open",
      text: "Who do you want to become in the next five years, and how would the right partner help you get there?",
      why: "The 'Michelangelo phenomenon': partners who affirm and support your ideal self help you grow toward it, and relationships thrive (Drigotas et al., 1999)." },
    { id: "tuesday", mod: "Going deeper", type: "open",
      text: "Describe a perfect, ordinary Tuesday evening with a partner, five years in.",
      why: "Long-term happiness is built in ordinary moments, not grand gestures. This reveals what you really need day to day." },
  ];

  const Lab = {
    i: -1, ans: {}, root: null, speak: () => {}, onDone: null,

    mount(root, speak) { this.root = root; this.speak = speak; this.intro(); },

    intro() {
      this.i = -1;
      this.root.innerHTML = `
        <div class="lab-intro">
          <div class="eyebrow">Ideal Partner Lab</div>
          <h2>Discover who you'll actually thrive with</h2>
          <p>Most of us write a checklist: tall, funny, successful. Research shows those lists barely predict who we click with or stay happy with. This lab asks better questions, the kind relationship science says matter.</p>
          <ul>
            <li><b>6 modules, ~23 questions</b>, about 8 minutes</li>
            <li>Attachment, wellbeing, values, conflict style, your checklist, and four deep reflection questions</li>
            <li>Ends with a personal profile with green flags, date questions and references</li>
            <li>Answers stay in your browser</li>
          </ul>
          <p class="muted">This is a reflective tool, not a clinical assessment.</p>
          <div class="lab-nav"><span></span><button class="primary" id="labStart">Begin the Lab</button></div>
        </div>`;
      this.root.querySelector("#labStart").onclick = () => this.go(0);
    },

    go(i) {
      this.i = i;
      if (i >= Q.length) return this.report();
      const q = Q[i];
      const pct = Math.round((i / Q.length) * 100);
      const a = this.ans[q.id];
      let body = "";
      if (q.type === "scale") {
        body = `<div class="scale">${[1, 2, 3, 4, 5, 6, 7].map((n) => `<button data-v="${n}" class="${a === n ? "sel" : ""}">${n}</button>`).join("")}</div>
          <div class="scale-labels"><span>${q.lo || "Strongly disagree"}</span><span>${q.hi || "Strongly agree"}</span></div>`;
      } else if (q.type === "multi") {
        const sel = a || [];
        body = `<div class="opts">${q.opts.map((o) => `<button class="opt ${sel.includes(o) ? "sel" : ""}" data-v="${o}">${o}</button>`).join("")}</div>`;
      } else if (q.type === "single") {
        body = `<div class="opts">${q.opts.map((o) => `<button class="opt ${a === o.v ? "sel" : ""}" data-v="${o.v}">${o.t}</button>`).join("")}</div>`;
      } else {
        body = `<textarea id="openIn" placeholder="Take your time. Write or press the mic and speak…">${a || ""}</textarea>`;
      }
      this.root.innerHTML = `
        <div class="lab-q">
          <div class="progress"><i style="width:${pct}%"></i></div>
          <div class="eyebrow">${q.mod} · ${i + 1} of ${Q.length}</div>
          <h2>${q.text}</h2>
          ${q.why ? `<div class="why">🔬 ${q.why}</div>` : ""}
          ${body}
          <div class="lab-nav">
            <button class="ghost small" id="back">← Back</button>
            <button class="primary" id="next">${i === Q.length - 1 ? "See my profile" : "Next →"}</button>
          </div>
        </div>`;
      const next = this.root.querySelector("#next");
      const valid = () => {
        const v = this.ans[q.id];
        next.disabled = q.type === "open" ? false : q.type === "multi" ? !(v && v.length) : v == null;
      };
      this.root.querySelectorAll(".scale button").forEach((b) => b.onclick = () => {
        this.ans[q.id] = +b.dataset.v;
        this.root.querySelectorAll(".scale button").forEach((x) => x.classList.toggle("sel", x === b));
        valid(); setTimeout(() => this.go(i + 1), 260);
      });
      this.root.querySelectorAll(".opt").forEach((b) => b.onclick = () => {
        if (q.type === "single") {
          this.ans[q.id] = b.dataset.v;
          this.root.querySelectorAll(".opt").forEach((x) => x.classList.toggle("sel", x === b));
          valid(); setTimeout(() => this.go(i + 1), 260); return;
        }
        let sel = this.ans[q.id] || [];
        const v = b.dataset.v;
        if (v === "None of these") sel = sel.includes(v) ? [] : [v];
        else {
          sel = sel.filter((x) => x !== "None of these");
          if (sel.includes(v)) sel = sel.filter((x) => x !== v);
          else if (sel.length < q.max) sel.push(v);
        }
        this.ans[q.id] = sel;
        this.root.querySelectorAll(".opt").forEach((x) => x.classList.toggle("sel", sel.includes(x.dataset.v)));
        valid();
      });
      const ta = this.root.querySelector("#openIn");
      if (ta) ta.oninput = () => { this.ans[q.id] = ta.value; };
      this.root.querySelector("#back").onclick = () => (i === 0 ? this.intro() : this.go(i - 1));
      next.onclick = () => this.go(i + 1);
      valid();
      this.speak(q.text);
    },

    // called by app when the mic captures speech during an open question
    dictate(text) {
      const q = Q[this.i];
      if (!q || q.type !== "open") return false;
      const ta = this.root.querySelector("#openIn");
      ta.value = (ta.value ? ta.value.trim() + " " : "") + text;
      this.ans[q.id] = ta.value;
      return true;
    },

    scores() {
      const A = this.ans, mean = (ids) => ids.reduce((s, id) => s + (A[id] || 4), 0) / ids.length;
      const v3 = 8 - (A.v3 || 4);
      return {
        anx: mean(["a1", "a2", "a3"]),
        avo: ((A.v1 || 4) + (A.v2 || 4) + v3) / 3,
        well: mean(["w1", "w2"]),
        growth: A.g1 || 4, destiny: A.d1 || 4,
      };
    },

    profile() {
      const s = this.scores(), A = this.ans;
      let style, styleText;
      if (s.anx <= 4 && s.avo <= 4) { style = "Secure-leaning"; styleText = "You're generally comfortable with closeness and trust that people will be there. That's a real strength: secure people tend to pick and keep healthier relationships, and can help partners feel safer too."; }
      else if (s.anx > 4 && s.avo <= 4) { style = "Anxious-leaning"; styleText = "You crave closeness and can be sensitive to signs of distance. That sensitivity also makes you attuned and loving. Your growth edge is self-soothing and choosing partners whose consistency calms your system, rather than ones whose unpredictability feels like chemistry."; }
      else if (s.anx <= 4 && s.avo > 4) { style = "Avoidant-leaning"; styleText = "You value independence and may feel crowded when closeness ramps up. That self-reliance is a strength. Your growth edge is letting someone in gradually, and choosing a partner who respects space without punishing you for needing it."; }
      else { style = "Fearful-leaning"; styleText = "You may want closeness and fear it at the same time, which can feel like push-pull. That's understandable, often rooted in past hurt. A patient, steady partner, and possibly support from a therapist, can help security grow over time."; }

      const conflictMap = {
        volatile: { name: "Volatile", match: "Volatile or validating partners who can stay warm in a heated moment. A strong avoider may feel overwhelmed by you.", tip: "Keep the passion, lose the contempt. Use a pause signal if either of you floods." },
        validating: { name: "Validating", match: "Most styles, especially other validators. You're the most flexible type.", tip: "Make sure 'calm' doesn't turn into never raising what matters." },
        avoiding: { name: "Avoiding", match: "Other conflict-minimizers, as Gottman found avoiding couples can be stable when both prefer it. A volatile partner may feel shut out.", tip: "Don't let important issues go unspoken for too long; resentment builds quietly." },
        stonewall: { name: "Withdrawing (stonewalling risk)", match: "A patient, non-pursuing partner, and building your skills to stay present.", tip: "Stonewalling is one of Gottman's four horsemen. Try: 'I'm flooded, I need 20 minutes, and I'll come back.' Then return." },
        critical: { name: "Critical (criticism/contempt risk)", match: "A secure, steady partner, and working on gentle start-ups.", tip: "Criticism and contempt are the strongest predictors of breakup in Gottman's research. Swap 'you always' for 'I feel… I need…'." },
      };
      return { s, style, styleText, conflict: conflictMap[A.conflict] || conflictMap.validating };
    },

    report() {
      const A = this.ans, { s, style, styleText, conflict } = this.profile();
      const values = A.values || [], deal = (A.deal || []).filter((d) => d !== "None of these");
      const pctScale = (v) => Math.round(((v - 1) / 6) * 100);
      const mtr = (label, v) => `<div class="meter"><span>${label}</span><div class="bar"><i style="width:${pctScale(v)}%"></i></div><span>${v.toFixed(1)}</span></div>`;
      const esc = (t) => (t || "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

      const greens = [
        "They're kind when no one's watching, to waiters, strangers, and to you when you're having a bad day.",
        "They stay steady under stress. Emotional stability (low neuroticism) in a partner is one of the most consistent predictors of satisfaction.",
        "You feel understood: they ask follow-up questions and remember what matters to you.",
        "They show up consistently. Words and actions match, and plans happen.",
        "They celebrate your good news with genuine enthusiasm.",
        "They can disagree with you without contempt, and repair afterward.",
      ];
      if (s.anx > 4) greens.push("They reply and check in reliably without you having to chase, and they're glad, not annoyed, when you ask for reassurance.");
      if (s.avo > 4) greens.push("They're secure in themselves: they enjoy time apart and don't read your need for space as rejection.");
      if (A.novel >= 5) greens.push("They're up for novelty, and say yes to new experiences with you.");
      if (A.novel <= 3) greens.push("They find comfort in rituals and routines, and enjoy cozy, predictable rhythms.");

      const valueQs = {
        "Family": "What did family dinners look like growing up, and what would you want to keep or change?",
        "Adventure": "What's the most spontaneous thing you've done, and would you do it again?",
        "Achievement & ambition": "What are you working toward right now that excites you?",
        "Security & stability": "What does feeling 'settled' look like to you in five years?",
        "Faith & spirituality": "What gives your life a sense of meaning?",
        "Creativity": "What do you make or create when no one's asking you to?",
        "Service & kindness to others": "When did you last go out of your way to help someone?",
        "Independence & freedom": "How do you like to spend a day entirely on your own?",
        "Tradition & culture": "Which traditions from your background matter most to you?",
        "Learning & growth": "What's something you changed your mind about recently?",
        "Health & wellbeing": "What does taking care of yourself look like for you?",
        "Fun & play": "What makes you laugh until you cry?",
      };
      const dateQs = values.map((v) => valueQs[v]).filter(Boolean);
      dateQs.push("When you're stressed, what helps you most, and what makes it worse?", "What's something you're proud of that people don't usually know about?", "How did your parents handle conflict, and how do you want to do it differently?");

      const checklist = [];
      if ((A.looks || 0) >= 6 || (A.money || 0) >= 6) checklist.push("You rated looks or earning potential as near-essential. That's honest! Just know that in a meta-analysis of ideal-partner preferences, these traits predicted actual attraction and relationship outcomes only weakly. In-person chemistry and how someone treats you carry much more weight. Consider holding these more loosely.");
      if ((A.kind || 0) >= 6) checklist.push("You prioritize kindness, and the science strongly backs you up: it's one of the most valued traits across cultures, and agreeable partners make for more satisfying relationships.");
      if ((A.kind || 0) <= 4) checklist.push("You rated kindness lower than many people do. It may be worth reconsidering: partner agreeableness is one of the more robust personality predictors of relationship satisfaction.");

      const mindset = s.destiny >= 5 && s.growth < 5
        ? "You lean toward 'destiny beliefs', the idea that the right relationship should feel easy. Research suggests this can lead people to leave when ordinary difficulties appear. Every good relationship has friction; what matters is repair."
        : s.growth >= 5
          ? "You hold strong 'growth beliefs': you see relationships as something built over time. That's linked to better coping with conflict and longer-lasting relationships."
          : "You're somewhere in the middle on destiny versus growth beliefs. Leaning toward growth, seeing challenges as normal and workable, is linked to more resilient relationships.";

      const wellNote = s.well < 4
        ? "You rated your current life satisfaction or self-soothing on the lower side. Be gentle with yourself: your own wellbeing is one of the strongest predictors of how happy any relationship will feel. Investing in yourself, friends, sleep, purpose, and maybe a therapist, is also investing in your future partnership."
        : "Your sense of wellbeing looks solid. That's a big asset, because how you feel in your own life spills over into every relationship.";

      const refs = ["joel20", "eastwick14", "eastwick08", "joel17", "fraley00", "fraley98", "arriaga18", "malouff10", "buss89", "gaunt06", "montoya08", "gottman94", "reis04", "gable04", "aron00", "aron97", "knee98", "drigotas99"];

      this.root.innerHTML = `
        <div class="report">
          <div class="eyebrow">Your Ideal Partner Profile</div>
          <h2>What the science says you'll thrive with</h2>
          <p class="muted">Based on your answers and peer-reviewed relationship research. A starting point for reflection, not a verdict.</p>

          <section>
            <h3>1 · The big picture</h3>
            <p>The largest study of its kind (43 datasets, over 11,000 couples) found that the best predictors of a happy relationship weren't matching hobbies or personality types. They were how the relationship <i>feels</i>: feeling your partner is committed, feeling appreciated, sexual satisfaction, believing your partner is happy, and low conflict. In other words, look less for "the perfect person" and more for <b>someone with whom you can build those feelings</b>.</p>
          </section>

          <section>
            <h3>2 · How you attach: ${style}</h3>
            ${mtr("Anxiety", s.anx)}${mtr("Avoidance", s.avo)}
            <p>${styleText}</p>
            <p class="muted">Attachment is best understood as two dimensions, not fixed boxes, and it can change: security grows in relationships with responsive partners.</p>
          </section>

          <section>
            <h3>3 · Your core values</h3>
            <p>${values.map((v) => `<span class="pill">${v}</span>`).join("") || "—"}</p>
            <p>Shared values matter more than shared interests. Look for someone who genuinely shares, or deeply respects, these.</p>
            ${deal.length ? `<p><b>Your non-negotiables:</b> ${deal.map((d) => `<span class="pill">${d}</span>`).join("")}</p><p class="muted">Raise these within the first few dates. It's not unromantic, it's respectful of both your time.</p>` : ""}
          </section>

          <section>
            <h3>4 · How you love</h3>
            <p><b>Conflict style: ${conflict.name}.</b> Good match: ${conflict.match}</p>
            <p>💡 ${conflict.tip}</p>
            ${mtr("Togetherness", A.together || 4)}${mtr("Social energy", A.social || 4)}${mtr("Novelty", A.novel || 4)}
            <p class="muted">Look for a partner within a point or two of you on these, or one who's open to finding a rhythm that works for both of you.</p>
          </section>

          <section>
            <h3>5 · Rethinking your checklist</h3>
            ${checklist.map((c) => `<p>${c}</p>`).join("") || "<p>Your priorities line up well with what research says matters most.</p>"}
            <p>${mindset}</p>
            <p>${wellNote}</p>
          </section>

          <section>
            <h3>6 · Green flags to look for</h3>
            <ul>${greens.map((g) => `<li>${g}</li>`).join("")}</ul>
          </section>

          <section>
            <h3>7 · Questions to ask on early dates</h3>
            <p class="muted">Gradually deeper, mutual self-disclosure builds closeness quickly (Aron et al., 1997).</p>
            <ul>${dateQs.map((q) => `<li>${q}</li>`).join("")}</ul>
          </section>

          ${(A.past || A.understood || A.bringout || A.tuesday) ? `
          <section>
            <h3>8 · In your own words</h3>
            ${A.understood ? `<p><b>What makes you feel understood</b></p><p class="quote">${esc(A.understood)}</p><p>That's your template for responsiveness. Notice who does this naturally.</p>` : ""}
            ${A.past ? `<p><b>A pattern to watch</b></p><p class="quote">${esc(A.past)}</p><p>When you feel that same pull again, slow down and ask: is this attraction, or familiarity?</p>` : ""}
            ${A.bringout ? `<p><b>Who you're becoming</b></p><p class="quote">${esc(A.bringout)}</p><p>The right partner will see this version of you and help sculpt it.</p>` : ""}
            ${A.tuesday ? `<p><b>Your ordinary Tuesday</b></p><p class="quote">${esc(A.tuesday)}</p>` : ""}
          </section>` : ""}

          <section id="aiReading" class="hidden">
            <h3>Sage's personal reading</h3>
            <div id="aiText" class="muted">Thinking…</div>
          </section>

          <section>
            <h3>References</h3>
            <ol class="refs">${refs.map((k) => `<li>${window.REFS[k]}</li>`).join("")}</ol>
          </section>

          <div class="lab-nav noprint">
            <button class="ghost small" id="retake">Retake</button>
            <div class="row">
              <button class="ghost small" id="aiBtn">✨ Personal reading (Claude)</button>
              <button class="primary" id="printBtn">Save / print</button>
            </div>
          </div>
        </div>`;
      this.root.querySelector("#retake").onclick = () => { this.ans = {}; this.intro(); };
      this.root.querySelector("#printBtn").onclick = () => window.print();
      this.root.querySelector("#aiBtn").onclick = () => this.aiReading();
      this.root.scrollIntoView({ behavior: "smooth", block: "start" });
      this.speak(`Here's your profile. Your attachment pattern looks ${style.toLowerCase()}, and your core values are ${values.join(", ") || "still open"}. The big takeaway from the research: look less for a perfect checklist, and more for kindness, steadiness, and someone who makes you feel understood. Have a read through, and if anything surprises you, come talk to me about it.`);
      try { localStorage.setItem("kindred_lab", JSON.stringify(this.ans)); } catch {}
    },

    async aiReading() {
      const box = this.root.querySelector("#aiReading"), txt = this.root.querySelector("#aiText");
      box.classList.remove("hidden");
      if (!window.ClaudeBrain.available()) {
        txt.innerHTML = "Connect Claude in Settings (⚙︎) with your own Anthropic API key to get a personalized written reading of your answers.";
        return;
      }
      txt.textContent = "Sage is reflecting on your answers…";
      const { s, style, conflict } = this.profile();
      const payload = { answers: this.ans, attachment: { anxiety: s.anx.toFixed(1), avoidance: s.avo.toFixed(1), style }, conflictStyle: conflict.name };
      try {
        const out = await window.ClaudeBrain.call(
          [{ role: "user", content: `Here are my Ideal Partner Lab answers (scales are 1–7):\n${JSON.stringify(payload, null, 2)}\n\nWrite me a warm, personal reading of about 250 words in plain prose (no markdown). Reflect my own words back, describe the kind of partner and relationship I'm likely to thrive in, one pattern to watch in myself, and two concrete next steps. Ground claims in relationship science and cite researcher and year only where you're confident.` }],
          "You are Sage, a warm, evidence-based relationship coach. You are careful and honest about scientific evidence, never overstate findings, and model healthy, secure relationship values.",
          16000, "medium");
        txt.classList.remove("muted");
        txt.innerHTML = out.split(/\n\n+/).map((p) => `<p>${p.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))}</p>`).join("");
        this.speak(out.split(/\n\n+/)[0]);
      } catch (e) {
        txt.textContent = "Couldn't reach Claude: " + e.message;
      }
    },
  };

  window.Lab = Lab;
})();
