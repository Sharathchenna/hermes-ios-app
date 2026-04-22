// Onboarding — 4 steps with real progression
const ONBOARDING_STEPS = ["welcome", "provider", "platforms", "memory"];

function ScreenOnboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [provider, setProvider] = useState(null);
  const [platforms, setPlatforms] = useState(new Set(["Telegram"]));
  const [name, setName] = useState("");

  const next = () => step < 3 ? setStep(step + 1) : onDone();
  const back = () => step > 0 ? setStep(step - 1) : null;

  return (
    <div className="ob">
      <div className="ob-top">
        <button className="ob-back" onClick={back} style={{ opacity: step ? 1 : 0 }}><Icon.back width="22" height="22"/></button>
        <div className="ob-dots">
          {ONBOARDING_STEPS.map((_, i) => <div key={i} data-on={i <= step} />)}
        </div>
        <button className="ob-skip" onClick={onDone}>Skip</button>
      </div>

      <div className="ob-body">
        {step === 0 && (
          <div className="ob-welcome">
            <div style={{ color: "var(--accent)" }}><HermesMark size={56} spin/></div>
            <h1>Hi. I'm your agent.</h1>
            <p className="serif-hero">The longer we work together, the better I get.</p>
            <p className="ob-sub">I write my own skills from what we do, remember what matters, and meet you on whichever app you actually use.</p>
            <div className="ob-name">
              <label>What should I call you?</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your first name" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="ob-step">
            <div className="step-kicker">Step 02 · Model</div>
            <h2>Where should I think?</h2>
            <p className="ob-sub">I run on any OpenAI-compatible endpoint. You keep your keys.</p>
            <div className="provider-list">
              {[
                { id: "nous", name: "Nous Portal", meta: "OAuth · recommended", tag: "Fast" },
                { id: "openrouter", name: "OpenRouter", meta: "200+ models, pay per token", tag: "Flexible" },
                { id: "local", name: "Local (Ollama)", meta: "Runs on your machine", tag: "Private" },
                { id: "custom", name: "Custom endpoint", meta: "Paste any OpenAI-compatible URL", tag: null },
              ].map(p => (
                <button key={p.id} className="prov" data-sel={provider === p.id} onClick={() => setProvider(p.id)}>
                  <div>
                    <div className="prov-name">{p.name}</div>
                    <div className="prov-meta">{p.meta}</div>
                  </div>
                  {p.tag && <span className="chip">{p.tag}</span>}
                  {provider === p.id && <span className="prov-check"><Icon.check width="18" height="18"/></span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="ob-step">
            <div className="step-kicker">Step 03 · Reach</div>
            <h2>Where should I find you?</h2>
            <p className="ob-sub">Pick any. Start one, continue on another — same agent, same memory.</p>
            <div className="platforms">
              {["Telegram","Discord","Slack","WhatsApp","Signal","Email","SMS","iMessage"].map(p => {
                const on = platforms.has(p);
                return (
                  <button key={p} className="plat" data-on={on} onClick={() => {
                    const s = new Set(platforms); on ? s.delete(p) : s.add(p); setPlatforms(s);
                  }}>
                    <span className="plat-dot" />
                    <span>{p}</span>
                    {on && <Icon.check width="16" height="16" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="ob-step">
            <div className="step-kicker">Step 04 · Memory</div>
            <h2>One last thing.</h2>
            <p className="ob-sub">I keep a small, readable file of what I learn about you. You can open it any time and edit with a pencil. Nothing goes anywhere you didn't send it.</p>
            <div className="mem-preview">
              <div className="mem-pre-head">
                <Icon.file width="14" height="14"/>
                <span>USER.md · 1 entry</span>
              </div>
              <div className="mem-pre-body">
                <div className="mem-row"><span>—</span> Prefers to be called {name || "you"}.</div>
                <div className="mem-row ghost"><span>—</span> I'll add more as we go.</div>
              </div>
            </div>
            <label className="toggle-row">
              <div>
                <div style={{fontWeight: 500}}>Let me write my own skills</div>
                <div className="sub">After tricky tasks, I'll save the approach so we don't redo the work.</div>
              </div>
              <div className="switch" data-on="true"><div /></div>
            </label>
          </div>
        )}
      </div>

      <div className="ob-footer">
        <button className="btn-primary" onClick={next}>
          {step === 3 ? "Start" : "Continue"}
          <Icon.chev width="18" height="18"/>
        </button>
      </div>

      <style>{`
        .ob { flex: 1; display: flex; flex-direction: column; color: var(--text); }
        .ob-top { display: flex; align-items: center; justify-content: space-between; padding: 8px 20px 0; }
        .ob-back { background: transparent; border: 0; color: var(--text); cursor: pointer; padding: 6px; border-radius: 999px; }
        .ob-skip { background: transparent; border: 0; color: var(--text-mute); font-size: 13px; cursor: pointer; padding: 6px 8px; }
        .ob-dots { display: flex; gap: 6px; }
        .ob-dots > div { width: 18px; height: 4px; background: var(--line); border-radius: 2px; transition: background 0.25s; }
        .ob-dots > div[data-on="true"] { background: var(--accent); }
        .ob-body { flex: 1; padding: 24px 24px 0; overflow-y: auto; min-height: 0; }

        .ob-welcome { padding-top: 32px; }
        .ob-welcome h1 { font-family: var(--font-serif); font-weight: 400; font-size: 42px; line-height: 1.15; letter-spacing: -0.01em; margin: 24px 0 14px; }
        .serif-hero { font-family: var(--font-serif); font-style: italic; font-size: 22px; color: var(--accent); margin: 0 0 22px; line-height: 1.35; }
        .ob-sub { color: var(--text-dim); line-height: 1.55; font-size: 15px; max-width: 30ch; margin: 0; }
        .ob-name { margin-top: 44px; }
        .ob-name label { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-mute); }
        .ob-name input { display: block; width: 100%; margin-top: 10px; padding: 14px 0 12px; background: transparent; border: 0; border-bottom: 1px solid var(--line); color: var(--text); font-size: 22px; outline: none; font-family: var(--font-serif); }
        .ob-name input:focus { border-bottom-color: var(--accent); }

        .ob-step { padding-top: 12px; }
        .step-kicker { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin-bottom: 14px; }
        .ob-step h2 { font-family: var(--font-serif); font-weight: 400; font-size: 36px; line-height: 1.05; letter-spacing: -0.01em; margin: 0 0 10px; }

        .provider-list { display: flex; flex-direction: column; gap: 10px; margin-top: 24px; }
        .prov { position: relative; display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; background: var(--surface); border: 1px solid var(--line-soft); border-radius: 18px; cursor: pointer; text-align: left; transition: all 0.15s; }
        .prov[data-sel="true"] { border-color: var(--accent); background: var(--surface-2); }
        .prov-name { font-weight: 500; font-size: 15px; }
        .prov-meta { color: var(--text-mute); font-size: 12.5px; margin-top: 3px; }
        .chip { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--accent); background: var(--accent-soft); padding: 4px 8px; border-radius: 999px; }
        .prov-check { color: var(--accent); margin-left: 10px; }

        .platforms { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 24px; }
        .plat { display: flex; align-items: center; gap: 10px; padding: 14px; background: var(--surface); border: 1px solid var(--line-soft); border-radius: 14px; cursor: pointer; text-align: left; color: var(--text); font-size: 14px; font-weight: 500; }
        .plat[data-on="true"] { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
        .plat-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--text-mute); }
        .plat[data-on="true"] .plat-dot { background: var(--accent); }
        .plat > svg:last-child { margin-left: auto; }

        .mem-preview { margin-top: 24px; background: var(--bg-2); border: 1px solid var(--line-soft); border-radius: 16px; overflow: hidden; font-family: var(--font-mono); font-size: 12.5px; }
        .mem-pre-head { display: flex; align-items: center; gap: 8px; padding: 10px 14px; color: var(--text-mute); border-bottom: 1px solid var(--line-soft); background: var(--surface); }
        .mem-pre-body { padding: 14px; color: var(--text); }
        .mem-row { display: flex; gap: 8px; margin-bottom: 6px; line-height: 1.5; }
        .mem-row span { color: var(--accent); }
        .mem-row.ghost { color: var(--text-mute); }

        .toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 20px; padding: 16px 0; border-top: 1px solid var(--line-soft); cursor: pointer; }
        .toggle-row .sub { color: var(--text-mute); font-size: 12.5px; margin-top: 3px; line-height: 1.5; }
        .switch { width: 44px; height: 26px; background: var(--line); border-radius: 999px; position: relative; transition: background 0.2s; flex-shrink: 0; }
        .switch > div { width: 22px; height: 22px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: transform 0.2s; }
        .switch[data-on="true"] { background: var(--accent); }
        .switch[data-on="true"] > div { transform: translateX(18px); }

        .ob-footer { padding: 16px 24px 20px; }
        .btn-primary { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px; background: var(--accent); color: #1a1208; border: 0; border-radius: 16px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .btn-primary:active { transform: scale(0.99); }
      `}</style>
    </div>
  );
}

window.ScreenOnboarding = ScreenOnboarding;
