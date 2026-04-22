// Chat — the centerpiece. Fully interactive: typing, streaming, tool-call cards, subagent hand-offs.
function ScreenChat({ onOpenSkill }) {
  const [messages, setMessages] = useState(CHAT_SEED);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(null); // streaming message
  const scrollRef = useRef(null);
  const [contextPct, setContextPct] = useState(0.22);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, pending]);

  // Scripted responses — feel real without needing LLM
  const scripts = [
    {
      match: /email|send|yes|go|ok|sure|ranked|agents|do it/i,
      steps: [
        { type: "thought", text: "Drafting three outreach emails. Using the tone from your last agent-outreach skill." },
        { type: "tool", tool: "skill.load", args: "agent-outreach-v3", result: "loaded · polite, concise, EN-PT blend", duration: "0.2s" },
        { type: "tool", tool: "subagent.spawn", args: "draft 3 agent emails in parallel", result: "subagent sa5 started", duration: "0.4s", opensSubagent: true },
        { type: "text", text: "Sent three drafts to your inbox. I kept them under 80 words each and left the asking-price question open so you can negotiate. I'll watch replies and nudge after 48 hours if we hear nothing." }
      ]
    },
    {
      match: /.*/,
      steps: [
        { type: "thought", text: "Checking memory, then searching." },
        { type: "tool", tool: "memory.search", args: "relevant entries", result: "3 matches in USER.md", duration: "0.1s" },
        { type: "tool", tool: "web.search", args: "latest context", result: "2 sources kept", duration: "1.4s" },
        { type: "text", text: "Here's what I found. I'll save the approach as a skill if it works — let me know after you try it." }
      ]
    }
  ];

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const userMsg = { id: "u" + Date.now(), role: "user", text, ts: nowShort() };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setBusy(true);

    const script = scripts.find(s => s.match.test(text)) || scripts[scripts.length - 1];

    // Typing indicator first
    setPending({ kind: "typing" });
    await sleep(700);

    for (const step of script.steps) {
      if (step.type === "thought") {
        setPending({ kind: "thought", text: step.text });
        await sleep(1100);
      } else if (step.type === "tool") {
        setPending(null);
        setMessages(m => [...m, { id: "t" + Date.now() + Math.random(), role: "hermes", kind: "tool", tool: step.tool, args: step.args, result: step.result, duration: step.duration, opensSubagent: step.opensSubagent }]);
        await sleep(900);
      } else if (step.type === "text") {
        // Stream tokens
        setPending({ kind: "stream", text: "" });
        const words = step.text.split(" ");
        let acc = "";
        for (const w of words) {
          acc += (acc ? " " : "") + w;
          setPending({ kind: "stream", text: acc });
          await sleep(35 + Math.random() * 55);
        }
        setPending(null);
        setMessages(m => [...m, { id: "h" + Date.now(), role: "hermes", text: step.text, ts: nowShort() }]);
      }
    }
    setContextPct(p => Math.min(0.95, p + 0.08));
    setBusy(false);
  };

  return (
    <div className="chat">
      <div className="chat-head">
        <div className="ch-left">
          <div className="ch-mark" style={{color: "var(--accent)"}}><HermesMark size={24} spin={busy}/></div>
          <div>
            <div className="ch-title">Hermes</div>
            <div className="ch-sub">
              <span className="k-dot" /> awake · haiku · claude-sonnet fallback
            </div>
          </div>
        </div>
        <div className="ch-right">
          <ContextRing pct={contextPct} />
          <button className="icon-btn" aria-label="More"><Icon.dots width="20" height="20"/></button>
        </div>
      </div>

      <div className="chat-scroll" ref={scrollRef}>
        <div className="day-sep"><span>Today · Lisbon</span></div>

        {messages.map(m => <Message key={m.id} m={m} onOpenSkill={onOpenSkill} />)}

        {pending && pending.kind === "typing" && (
          <div className="bubble hermes">
            <span className="typing"><span/><span/><span/></span>
          </div>
        )}
        {pending && pending.kind === "thought" && (
          <div className="thought">
            <span className="thought-dot"/><em>{pending.text}</em>
          </div>
        )}
        {pending && pending.kind === "stream" && (
          <div className="bubble hermes">
            {pending.text}<span className="caret"/>
          </div>
        )}
      </div>

      <div className="composer">
        <div className="comp-bar">
          <button className="comp-icon" aria-label="Attach"><Icon.plus width="20" height="20"/></button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder={busy ? "Hermes is working…" : "Message Hermes"}
            disabled={busy}
          />
          <button className="comp-send" onClick={send} disabled={busy || !input.trim()}>
            {busy ? <Icon.pause width="18" height="18"/> : <Icon.send width="18" height="18"/>}
          </button>
        </div>
        <div className="comp-meta">
          <button className="comp-pill"><Icon.bolt width="12" height="12"/> Skills auto</button>
          <button className="comp-pill"><Icon.web width="12" height="12"/> Web on</button>
          <button className="comp-pill"><Icon.terminal width="12" height="12"/> dusk-vm</button>
        </div>
      </div>

      <style>{`
        .chat { flex: 1; display: flex; flex-direction: column; min-height: 0; }
        .chat-head { display: flex; justify-content: space-between; align-items: center; padding: 4px 20px 14px; border-bottom: 1px solid var(--line-soft); }
        .ch-left { display: flex; gap: 10px; align-items: center; }
        .ch-title { font-weight: 500; font-size: 16px; letter-spacing: -0.01em; }
        .ch-sub { display: flex; align-items: center; gap: 6px; color: var(--text-mute); font-size: 11px; font-family: var(--font-mono); margin-top: 2px; }
        .ch-right { display: flex; align-items: center; gap: 4px; }
        .icon-btn { background: transparent; border: 0; color: var(--text-dim); padding: 8px; border-radius: 10px; cursor: pointer; }

        .chat-scroll { flex: 1; overflow-y: auto; padding: 16px 16px 8px; display: flex; flex-direction: column; gap: 10px; min-height: 0; }
        .day-sep { text-align: center; margin: 4px 0 8px; font-family: var(--font-mono); font-size: 10.5px; color: var(--text-mute); letter-spacing: 0.08em; text-transform: uppercase; }

        .bubble { max-width: 82%; padding: 11px 14px; border-radius: 18px; font-size: 15px; line-height: 1.4; }
        .bubble.user { align-self: flex-end; background: var(--accent); color: #1a1208; border-bottom-right-radius: 6px; }
        .bubble.hermes { align-self: flex-start; background: var(--surface); border: 1px solid var(--line-soft); color: var(--text); border-bottom-left-radius: 6px; }
        .bubble-ts { font-size: 10px; color: var(--text-mute); font-family: var(--font-mono); margin: 2px 4px 0; }
        .bubble.user + .bubble-ts { text-align: right; }

        .typing { display: inline-flex; gap: 4px; padding: 2px 0; }
        .typing > span { width: 6px; height: 6px; background: var(--text-mute); border-radius: 50%; animation: typ 1.2s ease-in-out infinite; }
        .typing > span:nth-child(2) { animation-delay: 0.15s; }
        .typing > span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes typ { 0%, 60%, 100% { opacity: 0.3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
        .caret { display: inline-block; width: 2px; height: 16px; background: var(--accent); vertical-align: -3px; margin-left: 2px; animation: caret 1s steps(2) infinite; }
        @keyframes caret { 50% { opacity: 0; } }

        .thought { display: flex; gap: 8px; align-items: flex-start; color: var(--text-mute); font-size: 12.5px; padding: 4px 14px; font-style: italic; font-family: var(--font-serif); }
        .thought-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--accent); margin-top: 8px; flex-shrink: 0; }

        .tool-card { align-self: flex-start; background: var(--bg-2); border: 1px solid var(--line-soft); border-radius: 14px; padding: 10px 12px; font-family: var(--font-mono); font-size: 11.5px; max-width: 90%; display: flex; flex-direction: column; gap: 4px; }
        .tc-head { display: flex; align-items: center; gap: 8px; color: var(--accent); }
        .tc-name { font-weight: 500; }
        .tc-dur { color: var(--text-mute); margin-left: auto; font-size: 10px; }
        .tc-args { color: var(--text-dim); padding-left: 20px; }
        .tc-args::before { content: "→ "; color: var(--text-mute); }
        .tc-result { color: var(--text); padding-left: 20px; }
        .tc-result::before { content: "✓ "; color: var(--good); }

        .composer { padding: 10px 14px 14px; border-top: 1px solid var(--line-soft); background: oklch(0.17 0.012 50 / 0.8); backdrop-filter: blur(12px); }
        .comp-bar { display: flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--line-soft); border-radius: 22px; padding: 4px 4px 4px 8px; }
        .comp-bar input { flex: 1; border: 0; background: transparent; padding: 10px 6px; color: var(--text); font-size: 15px; outline: none; }
        .comp-bar input::placeholder { color: var(--text-mute); }
        .comp-icon { background: transparent; border: 0; color: var(--text-dim); padding: 8px; border-radius: 50%; cursor: pointer; }
        .comp-send { background: var(--accent); border: 0; color: #1a1208; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .comp-send:disabled { opacity: 0.4; }

        .comp-meta { display: flex; gap: 6px; padding: 10px 2px 0; }
        .comp-pill { display: inline-flex; align-items: center; gap: 4px; padding: 5px 9px; background: transparent; border: 1px solid var(--line-soft); color: var(--text-mute); border-radius: 999px; font-family: var(--font-mono); font-size: 10.5px; cursor: pointer; }
      `}</style>
    </div>
  );
}

function Message({ m, onOpenSkill }) {
  if (m.kind === "tool") {
    return (
      <div className="tool-card" onClick={() => m.opensSubagent && onOpenSkill && onOpenSkill("subagents")}>
        <div className="tc-head">
          <Icon.bolt width="13" height="13"/>
          <span className="tc-name">{m.tool}</span>
          <span className="tc-dur">{m.duration}</span>
        </div>
        <div className="tc-args">{m.args}</div>
        <div className="tc-result">{m.result}</div>
      </div>
    );
  }
  return (
    <>
      <div className={`bubble ${m.role}`}>{m.text}</div>
      {m.ts && <div className="bubble-ts">{m.ts}</div>}
    </>
  );
}

function ContextRing({ pct }) {
  const r = 11, c = 2 * Math.PI * r;
  return (
    <div className="ctx-ring" title={`Context ${Math.round(pct*100)}%`}>
      <svg width="28" height="28" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r={r} fill="none" stroke="var(--line)" strokeWidth="2"/>
        <circle cx="14" cy="14" r={r} fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round" transform="rotate(-90 14 14)"/>
      </svg>
    </div>
  );
}

function nowShort() {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

window.ScreenChat = ScreenChat;
