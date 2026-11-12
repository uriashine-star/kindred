/* Sage's brains:
 *  1. LocalBrain — a built-in, research-grounded coaching engine (works offline, no key needed).
 *  2. ClaudeBrain — optional, uses the visitor's own Anthropic API key for open-ended conversation.
 */
(function () {
  const pick = (arr, used) => {
    const fresh = arr.filter((x) => !used.has(x));
    const pool = fresh.length ? fresh : arr;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    used.add(choice);
    return choice;
  };

  const FEELINGS = ["heartbroken", "devastated", "lonely", "anxious", "nervous", "scared", "afraid", "angry", "furious", "frustrated", "hurt", "sad", "confused", "jealous", "insecure", "numb", "stuck", "overwhelmed", "exhausted", "guilty", "ashamed", "rejected", "unloved", "invisible", "excited", "happy", "hopeful", "grateful", "torn", "betrayed", "resentful", "bored", "trapped"];

  // Each topic: match regex, first replies (with citations), deeper follow-ups for the next turn.
  const TOPICS = [
    {
      id: "crisis", priority: 100,
      re: /\b(kill myself|suicid|end my life|want to die|self[- ]?harm|hurt myself|no reason to live)\b/i,
      replies: [
        "I'm really glad you told me. What you're feeling matters, and you deserve support from a real person right now. If you're in the US, you can call or text 988 to reach the Suicide and Crisis Lifeline any time. Outside the US, please contact your local emergency number or a crisis line. If you're in immediate danger, call emergency services. I'm still here to talk while you reach out. Is there someone you trust who could be with you tonight?",
      ],
      cite: [],
    },
    {
      id: "abuse", priority: 90,
      re: /\b(hits? me|hit me|abus|afraid of (him|her|them|my partner)|scared of (him|her|them|my partner)|threaten|chok|won'?t let me (see|talk|go)|controls? (my|all my) (money|phone)|checks my phone|track(s|ing)? (me|my location)|forced? me)\b/i,
      replies: [
        "Thank you for trusting me with that. What you're describing can be a sign of abuse or coercive control, which is about one partner restricting the other's freedom, not just arguments. You deserve to feel safe. In the US, the National Domestic Violence Hotline is free and confidential: call 1-800-799-7233 or text START to 88788. If you're in danger right now, call 911 or your local emergency number. Would it help to talk through what feels safe for you right now?",
      ],
      cite: ["stark07"],
    },
    {
      id: "ideal", priority: 60,
      re: /\b(ideal partner|right (person|one|partner)|my type|what (kind|type) of (person|partner)|who (should|would) (i|be good)|soul ?mate|compatib|perfect match|who.*right for me)\b/i,
      replies: [
        "I'd love to explore that with you. Here's something surprising from the research: the checklists people write before dating barely predict who they actually click with in person. What does predict lasting happiness is things like kindness, emotional stability, responsiveness and shared core values. I built the Ideal Partner Lab to walk you through deep questions grounded in that evidence. Want to start it?",
      ],
      cite: ["eastwick08", "joel17", "joel20"], action: "lab",
    },
    {
      id: "conflict", priority: 50,
      re: /\b(fight|fighting|argu|same fight|yell|scream|bicker|disagree|conflict|blow ?up|we keep)\b/i,
      replies: [
        "Recurring fights are really common, and the research has a hopeful angle on it: most couple conflicts are perpetual, and happy couples don't solve them all, they get better at talking about them. The biggest warning signs aren't the topic, they're the four horsemen: criticism, contempt, defensiveness, and stonewalling. When you two argue, which of those shows up most?",
        "Let's slow the pattern down. Gottman's lab found that how a conversation starts predicts how it ends about ninety-six percent of the time in their sample. A soft start-up sounds like: I feel, about this situation, and I need. For example: I feel lonely when we're on our phones at dinner, could we put them away? What's the fight usually about on the surface?",
      ],
      follow: [
        "One more tool: if your heart is pounding and you can't think straight, you're likely flooded. Take a real break of at least twenty minutes, doing something calming, not rehearsing the argument, then come back. Gottman found flooded partners literally can't process what's said. Could you agree on a break signal together?",
        "Try the 'dreams within conflict' question: what's the deeper wish or fear underneath your position? Often a fight about dishes is really about feeling respected or cared for. What do you think is underneath this one for you?",
        "Notice ratio, too. Stable couples have about five positive interactions for every negative one, even during conflict. Small things count: a touch, a joke, saying you have a point. What's one small positive thing you could add this week?",
      ],
      keyed: [
        { re: /critic|always|never|blame|nag/i, text: "Thank you for being honest, that takes self-awareness. 'You always' and 'you never' are classic criticism, which attacks the person rather than the behavior. The antidote is a gentle start-up: describe the situation, your feeling, and a positive need. For example: I'm feeling overwhelmed with the dishes tonight, could you take them? How do you think he'd respond to that?" },
        { re: /contempt|eye ?roll|mock|sarcas|disgust|insult/i, text: "Contempt, things like eye-rolling, mockery or sarcasm, was the single strongest predictor of divorce in Gottman's research. The antidote is building a culture of appreciation: regularly noticing and saying what you value in each other. What's something you genuinely appreciate about them that you haven't said lately?" },
        { re: /defens|excuse|not my fault|turn it around/i, text: "Defensiveness is so natural, it's self-protection. But it tends to escalate things, because the other person feels unheard. The antidote is taking responsibility for even a small part: you're right, I did leave that. Which part of the pattern could you own, even a little?" },
        { re: /shut ?down|silent|stonewall|walk(s)? away|ignore|silent treatment|withdraw/i, text: "Shutting down usually happens when someone's flooded, their heart rate spikes and they can't take more in. The antidote is physiological self-soothing: agree on a break of at least twenty minutes, then come back to the conversation. Who tends to shut down, you or them?" },
      ],
      cite: ["gottman94", "gottman99", "gottman00"],
    },
    {
      id: "breakup", priority: 50,
      re: /\b(break ?up|broke up|dumped|ex\b|my ex|left me|divorce|heart ?broken|heartbreak|get over|moving on|move on|split up)\b/i,
      replies: [
        "I'm so sorry. Breakups activate the same attachment system that bonds us, so the pain is real, not a weakness. The good news from the research: most people recover faster than they predict, and sadness tends to lift steadily over the first few months. How long has it been, and what's the hardest moment of the day right now?",
        "That's a lot to carry. One gentle evidence-based step: limit checking your ex's social media. A study by Marshall found that monitoring an ex online was linked to more distress, longing and less personal growth. Would muting or archiving them feel possible for now?",
      ],
      follow: [
        "Something that helps: rediscovering who you are outside the relationship. Lewandowski's research found that people who reconnected with activities and parts of themselves they'd let go reported real growth after a breakup. What's something you used to love that you dropped?",
        "Try writing about it. Pennebaker's expressive writing studies found that writing about your deepest feelings for fifteen to twenty minutes a day, for a few days, can improve mood and even health. You can write it here with me if you like. What do you most wish you could say?",
        "Be kind to yourself in this. Self-compassion, treating yourself like you would a good friend, is linked to healthier relationships and recovery. What would you tell a friend going through exactly this?",
      ],
      cite: ["sbarra06", "marshall12", "lewandowski07", "pennebaker97"],
    },
    {
      id: "anxious", priority: 55,
      re: /\b(text(s|ed|ing)? (me )?back|didn'?t text|not texting|reply|ghost|left on read|reassur|clingy|needy|abandon|they'?ll leave|losing (him|her|them)|overthink|anxious attachment)\b/i,
      replies: [
        "That waiting feeling can be so intense. In attachment research, that spike of alarm when someone goes quiet is a hallmark of attachment anxiety, your nervous system scanning for disconnection. It's not a character flaw, and it can shift: studies show security grows in relationships with consistent, responsive partners. When they don't reply, what story does your mind tell you?",
        "Let's work with that. Anxiety often pushes us toward protest behaviors, like double-texting, checking, or pulling away to test them. A steadier move is to soothe yourself first, then ask directly for what you need: I feel more connected when we check in once during the day. Does asking for that feel scary?",
      ],
      follow: [
        "Here's a quick self-soothing practice: name the feeling, notice where it is in your body, take five slow breaths with longer exhales, then ask: what do I actually know, versus what am I predicting? What do you actually know right now?",
        "It's also worth noticing who you're choosing. Anxiously attached people are often drawn to avoidant partners, because the push-pull feels like chemistry. A secure partner can feel less thrilling at first, but much calmer over time. Does that push-pull sound familiar?",
      ],
      cite: ["hazan87", "fraley00", "arriaga18"],
    },
    {
      id: "avoidant", priority: 45,
      re: /\b(pull(s|ing)? away|distant|cold|shut(s|ting)? down|won'?t open up|emotionally unavailable|needs space|too much space|avoidant|commitment ?phob|feel suffocated|smother)\b/i,
      replies: [
        "That distance can feel lonely, whichever side you're on. Attachment avoidance is about discomfort with closeness and dependence, often learned early when needing people didn't feel safe. It's dimensional, not a fixed label. Are you the one wanting more closeness here, or the one who wants more space?",
      ],
      follow: [
        "What tends to help with avoidance is closeness that doesn't feel like pressure: side-by-side activities, predictable time apart, and naming needs calmly rather than pursuing. Research on attachment change suggests feeling safe and not controlled is what slowly builds trust. What would a 'no pressure' moment of connection look like for you two?",
      ],
      cite: ["fraley00", "arriaga18"],
    },
    {
      id: "jealousy", priority: 48,
      re: /\b(jealous|trust issue|don'?t trust|insecure|suspicious|flirt|talking to (someone|other)|their phone)\b/i,
      replies: [
        "Jealousy is a really human signal, it usually means something precious feels threatened. The question is whether it's about something happening now, or an old wound being touched. Is there something specific that happened, or is it more of a feeling you can't shake?",
      ],
      follow: [
        "If it's specific, it's fair to talk about it using I-statements and agreed boundaries, what you two each consider okay. If it's more of a general fear, that's worth working on in yourself, because checking and testing usually erode trust rather than build it. What would make you feel secure, in concrete terms?",
      ],
      cite: ["fraley00"],
    },
    {
      id: "cheating", priority: 52,
      re: /\b(cheat|affair|unfaithful|infidel|slept with|betray)\b/i,
      replies: [
        "I'm so sorry, betrayal can shake the ground under you. Whatever you decide, your feelings are valid: shock, rage, grief and even numbness are all normal. Some couples do rebuild; Gottman's approach describes three phases: atonement, attunement, and building a new attachment. Right now, are you trying to understand what happened, or decide whether to stay?",
      ],
      follow: [
        "Recovery, if both choose it, requires the person who strayed to take full responsibility, be transparent, and tolerate questions without defensiveness. It's slow, and a couples therapist trained in affair recovery helps a lot. What do you feel you need most right now, for yourself?",
      ],
      cite: ["gottman99"],
    },
    {
      id: "dating", priority: 40,
      re: /\b(dating|date|apps?|tinder|hinge|bumble|match|meet (someone|people)|single|first date|asking (him|her|them) out|crush)\b/i,
      replies: [
        "Dating can be exhausting! A useful insight from a big review of online dating: profiles and algorithms are poor at predicting chemistry, because attraction mostly emerges in person. So the evidence suggests moving from chatting to a short, low-pressure meeting fairly soon. How are you mostly meeting people right now?",
        "On first dates, try asking questions that go one level deeper than the usual. In Aron's famous closeness study, strangers who took turns with gradually more personal questions felt dramatically closer within an hour. Something like: what's a small thing that made your week? Or: what are you most proud of that people don't know about? What usually happens on your first dates?",
      ],
      follow: [
        "Also watch for responsiveness: do they listen, remember what you said, and make you feel understood? Perceived responsiveness is one of the strongest predictors of intimacy we know of. It's much more telling than whether you share a favorite band. Who's someone you've met who made you feel that way?",
        "If you'd like, the Ideal Partner Lab can help you get clear on what actually matters to you, so you can spot it faster. Want to try it?",
      ],
      cite: ["finkel12", "aron97", "reis04"],
    },
    {
      id: "lonely", priority: 35,
      re: /\b(lonely|alone|no one|nobody|isolated|no friends|forever alone)\b/i,
      replies: [
        "Loneliness is painful, and you're far from alone in feeling it. A huge meta-analysis found that social connection matters for health about as much as major lifestyle factors like smoking. That's a sign of how wired for connection we are, not a sign something's wrong with you. Is the loneliness more about romance, or about connection in general?",
      ],
      follow: [
        "One evidence-informed idea: friendships and love both grow from repeated, unplanned contact. Joining something recurring, a class, a club, a volunteer shift, gives you the repeated exposure that builds closeness naturally. Is there something you've been curious to try?",
      ],
      cite: ["holt10"],
    },
    {
      id: "spark", priority: 42,
      re: /\b(bored|boring|spark|passion|rut|routine|roommates?|stale|fell out of love|falling out of love|not in love)\b/i,
      replies: [
        "Feeling in a rut is really common in long relationships, and very fixable. In Aron's experiments, couples who did novel, slightly challenging activities together, even something silly in a lab, reported higher relationship quality than couples doing pleasant but familiar things. When did you two last do something genuinely new together?",
      ],
      follow: [
        "Another small but mighty habit is gratitude. Algoe's research found that everyday expressions of gratitude acted like a booster shot for relationships, increasing connection for both partners. Could you try telling them one specific thing you appreciate each day this week?",
        "And try responding enthusiastically to their good news. Gable's research found that 'active-constructive' responses, genuine interest and excitement with follow-up questions, predicted relationship satisfaction more than how couples handle bad news. How do you usually react when they share a win?",
      ],
      cite: ["aron00", "algoe10", "gable04"],
    },
    {
      id: "communication", priority: 38,
      re: /\b(don'?t listen|not listening|unheard|doesn'?t understand|communicat|talk to (him|her|them)|open up|express|tell (him|her|them) how)\b/i,
      replies: [
        "Feeling unheard is so draining. Research points to perceived responsiveness, feeling understood, validated and cared for, as a core ingredient of intimacy. The good news is it's learnable. When you try to talk to them, what usually happens?",
      ],
      follow: [
        "A simple structure that helps: one person speaks, the other reflects back what they heard before responding. What I'm hearing is, and did I get that right? It feels clunky at first, but it lowers defensiveness fast. Do you think they'd be open to trying it?",
        "Also try asking for what you need explicitly. Partners aren't mind readers, and the research on idealization shows we often assume they know us better than they do. What's one thing you've been hoping they'd just figure out?",
      ],
      cite: ["reis04", "gable04"],
    },
    {
      id: "intimacy", priority: 40,
      re: /\b(sex|sexual|libido|desire|intimacy|intimate|bedroom|physical touch)\b/i,
      replies: [
        "Thanks for being open about that, it's an important part of many relationships. Desire differences are extremely common, and they're not a sign you're incompatible. One interesting finding: in a large study, well-being rose with sexual frequency up to about once a week, and then leveled off. So quality and connection matter more than hitting a number. What feels like the core tension for you two?",
      ],
      follow: [
        "Talking about it outside the bedroom, at a calm time, with curiosity rather than blame, tends to work best. Questions like: what helps you feel desire? What gets in the way? What would you love more of? Have you two ever had a conversation like that?",
      ],
      cite: ["muise16"],
    },
    {
      id: "stay", priority: 46,
      re: /\b(should i (stay|leave|break)|stay or (go|leave)|leave (him|her|them)|end (it|things)|not sure (about|if)|doubts?|is (he|she|they) the one|worth (it|saving))\b/i,
      replies: [
        "That's one of the hardest questions there is, and I won't pretend to answer it for you, but I can help you think clearly. Research on commitment highlights three things: how satisfied you are, how attractive your alternatives feel, including being single, and how much you've invested. Separately, contempt and a lack of basic respect are strong warning signs. If you imagine your life in five years with them, what do you feel in your body?",
      ],
      follow: [
        "It can help to separate 'this is hard right now' from 'this is fundamentally wrong for me.' Ask yourself: do I feel respected? Safe? Do I like who I am around them? Are our core values and life goals compatible, like kids, where to live, faith? Which of those feels shakiest?",
        "Notice also whether investment is keeping you there more than satisfaction. Sunk costs are real feelings, but they're not a reason on their own. If you'd just met this person today, knowing everything you know, would you choose them?",
      ],
      cite: ["le03", "le10", "gottman00"],
    },
    {
      id: "family", priority: 35,
      re: /\b(in-?laws?|mother-in-law|his (mom|mother|family|parents)|her (mom|mother|family|parents)|their (family|parents)|my (parents|family) (don'?t|hate|dislike))\b/i,
      replies: [
        "Family dynamics can put so much strain on a couple. A helpful principle from couples research is that partners do best when they present a united front, each person handling their own family, while backing each other up. Does your partner feel on your side with this?",
      ],
      cite: ["gottman99"],
    },
    {
      id: "distance", priority: 40,
      re: /\b(long[- ]distance|ldr|different (city|country|cities)|far away|time zone)\b/i,
      replies: [
        "Long-distance can be hard but it's not doomed. One study found long-distance couples actually reported more intimacy than geographically close ones, partly because they disclosed more and idealized each other a bit. The key risk is the reunion, when idealization meets reality. Do you two have an end date for the distance?",
      ],
      cite: ["jiang13"],
    },
    {
      id: "money", priority: 38,
      re: /\b(money|financ|debt|spend|budget|salary|bills?)\b/i,
      replies: [
        "Money is one of the most loaded topics for couples. Research by Dew and colleagues found that frequent money disagreements predicted divorce more strongly than many other kinds of disagreements, likely because money stands in for values: security, freedom, fairness. What does money mean to you, and what do you think it means to them?",
      ],
      cite: ["dew12"],
    },
    {
      id: "lovelang", priority: 44,
      re: /\blove language/i,
      replies: [
        "Love languages are a fun conversation starter, but honestly, the scientific support is weak. A 2024 review by Impett and colleagues found little evidence that people have one primary love language or that matching languages makes couples happier. What does seem to matter is that partners express love in many ways and stay responsive to what the other needs in the moment. What makes you feel most loved?",
      ],
      cite: ["impett24"],
    },
    {
      id: "selfworth", priority: 36,
      re: /\b(not good enough|unlovable|hate myself|ugly|worthless|boundar|people pleas|say no|doormat|walk all over)\b/i,
      replies: [
        "I hear how hard you're being on yourself. Research by Neff found that self-compassion is linked with being a more caring, accepting partner, and less controlling or aggressive. Treating yourself with kindness isn't selfish, it actually makes you better at love. If a friend said what you just said, how would you respond to them?",
      ],
      follow: [
        "Boundaries are a form of self-respect. A simple script: when this happens, I feel this, and I need this. And if it continues, here's what I'll do. You're not controlling their behavior, you're deciding yours. Is there a boundary you've been wanting to set?",
      ],
      cite: ["neff13"],
    },
    {
      id: "greet", priority: 10,
      re: /^(hi|hey|hello|yo|hiya|good (morning|afternoon|evening)|howdy|shalom)\b/i,
      replies: [
        "Hi, it's lovely to meet you. I'm Sage. What's on your heart today?",
        "Hello! I'm glad you're here. Is there something in your love life or a relationship you'd like to talk about?",
      ],
    },
    {
      id: "thanks", priority: 10,
      re: /\b(thank|thanks|appreciate (it|you)|that helps|helpful)\b/i,
      replies: [
        "You're so welcome. It takes courage to look at this stuff honestly. Is there anything else you'd like to explore?",
        "I'm really glad it helped. I'm here whenever you want to keep talking.",
      ],
    },
    {
      id: "bye", priority: 10,
      re: /\b(bye|goodbye|good night|see you|gotta go|talk later)\b/i,
      replies: ["Take good care of yourself. Remember, healthy love starts with how you treat yourself. Come back anytime."],
    },
    {
      id: "whoami", priority: 12,
      re: /\b(are you (real|human|a bot|ai)|who are you|what are you)\b/i,
      replies: ["I'm Sage, an AI relationship coach. I'm not a human or a licensed therapist, but I draw on relationship science, people like Gottman, Reis, Aron, Eastwick and Finkel, to help you reflect and try evidence-based ideas. What would you like to work on?"],
    },
  ];

  const swapPronouns = (s) => s.replace(/\b(I|me|my|mine|myself|am|I'm|I've|I'll|you|your|yours)\b/gi, (w) => {
    const map = { i: "you", me: "you", my: "your", mine: "yours", myself: "yourself", am: "are", "i'm": "you're", "i've": "you've", "i'll": "you'll", you: "I", your: "my", yours: "mine" };
    return map[w.toLowerCase()] || w;
  });

  const OPEN_QS = [
    "Tell me more. What part of that feels heaviest for you?",
    "How long have you been feeling this way?",
    "What do you wish they understood about you?",
    "If this went really well, what would be different a month from now?",
    "What do you need most right now: to be heard, to make a decision, or to find a next step?",
    "When you picture the healthiest version of this relationship, what does an ordinary day look like?",
  ];

  const LocalBrain = {
    used: new Set(), lastTopic: null, followIdx: {}, name: null, turns: 0,

    respond(text) {
      this.turns++;
      const t = text.trim();
      const nameM = t.match(/\b(?:my name is|i'?m called|call me)\s+([A-Z][a-z]+)/i);
      if (nameM) this.name = nameM[1][0].toUpperCase() + nameM[1].slice(1).toLowerCase();

      const hits = TOPICS.filter((x) => x.re.test(t)).sort((a, b) => b.priority - a.priority);
      const topic = hits[0];
      const feeling = FEELINGS.find((f) => new RegExp(`\\b${f}\\b`, "i").test(t));

      // New topic → first-level reply
      if (topic && (topic.id !== this.lastTopic || (!topic.follow && !topic.keyed))) {
        this.lastTopic = topic.id;
        let reply = pick(topic.replies, this.used);
        if (feeling && !["crisis", "abuse", "greet"].includes(topic.id) && !/sorry|hear how|feeling/i.test(reply.slice(0, 40))) {
          reply = `It makes sense that you'd feel ${feeling}. ` + reply;
        }
        if (nameM && topic.id === "greet") reply = `Lovely to meet you, ${this.name}. ` + reply.replace(/^Hi, it's lovely to meet you\. /, "");
        return { text: reply, cite: topic.cite || [], action: topic.action };
      }

      if (nameM && !topic) { this.lastTopic = null; return { text: `It's lovely to meet you, ${this.name}. What's on your heart today?`, cite: [] }; }

      // Continuing the same topic → go deeper
      const cur = TOPICS.find((x) => x.id === this.lastTopic);
      const keyed = cur && cur.keyed && cur.keyed.find((k) => k.re.test(t) && !this.used.has(k.text));
      if (keyed) { this.used.add(keyed.text); return { text: keyed.text, cite: cur.cite || [] }; }
      if (cur && cur.follow) {
        const i = this.followIdx[cur.id] || 0;
        if (i < cur.follow.length) {
          this.followIdx[cur.id] = i + 1;
          const lead = feeling ? `I can hear that you feel ${feeling}. ` : pick(["Thank you for sharing that. ", "I appreciate your honesty. ", "That makes sense. ", "I hear you. "], new Set());
          return { text: lead + cur.follow[i], cite: cur.cite || [] };
        }
      }

      // Nameless / general reflection
      if (nameM) return { text: `It's lovely to meet you, ${this.name}. What's on your heart today?`, cite: [] };
      const clause = t.split(/[.!?]/).filter(Boolean).pop() || t;
      const short = clause.split(/\s+/).length <= 14 && clause.split(/\s+/).length >= 3;
      const parts = [];
      if (feeling) parts.push(`It sounds like you're feeling ${feeling}, and that's completely valid.`);
      else if (short && /\b(i|my|me)\b/i.test(clause)) parts.push(`So ${swapPronouns(clause.trim().replace(/^(and|but|so)\s+/i, ""))}. I hear you.`);
      else parts.push(pick(["I'm listening.", "Thank you for telling me that.", "That sounds important."], new Set()));
      parts.push(pick(OPEN_QS, this.used));
      this.lastTopic = null;
      return { text: parts.join(" "), cite: [] };
    },
  };

  const SYSTEM = `You are Sage, a warm, emotionally healthy, evidence-based relationship coach inside a website called Kindred. You speak aloud through an animated face, so:
- Reply in 2–5 short, natural spoken sentences. No markdown, no lists, no emojis, no headings.
- Usually end with ONE thoughtful question that helps the person go deeper.
- Ground advice in peer-reviewed relationship science (e.g. Gottman, Reis, Gable, Aron, Eastwick & Finkel, Joel, attachment research by Hazan & Shaver / Fraley). Name a researcher and year only when you are confident it is accurate; never invent studies. Say when evidence is weak or mixed (e.g. love languages).
- Model healthy relationship values: mutual respect, autonomy, consent, honesty, secure attachment, self-compassion. Never encourage manipulation, games, jealousy tactics or controlling behavior.
- You are not a therapist and don't diagnose. If someone mentions abuse, coercive control, danger, self-harm or suicide, prioritize safety: in the US mention 988 (Suicide & Crisis Lifeline) or the National Domestic Violence Hotline 1-800-799-7233 / text START to 88788, and local emergency services elsewhere.
- If the person wants help figuring out their ideal partner, you can mention the "Ideal Partner Lab" tab on the site.`;

  const ClaudeBrain = {
    history: [],
    key() { try { return localStorage.getItem("kindred_key") || ""; } catch { return ""; } },
    available() { return !!this.key(); },

    async call(messages, system, maxTokens = 16000, effort = "low") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": this.key(),
          "anthropic-version": "2023-06-01",
          "anthropic-beta": "server-side-fallback-2026-07-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-opus-5-5",
          max_tokens: maxTokens,
          system,
          output_config: { effort },
          fallbacks: "default",
          messages,
        }),
      });
      if (!res.ok) {
        let msg = res.status + "";
        try { const j = await res.json(); msg = j.error?.message || msg; } catch {}
        throw new Error(msg);
      }
      const data = await res.json();
      if (data.stop_reason === "refusal") throw new Error("refusal");
      return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join(" ").trim();
    },

    async respond(text) {
      this.history.push({ role: "user", content: text });
      const reply = await this.call(this.history.slice(-30), SYSTEM);
      this.history.push({ role: "assistant", content: reply });
      return { text: reply, cite: [] };
    },
  };

  window.LocalBrain = LocalBrain;
  window.ClaudeBrain = ClaudeBrain;
})();
