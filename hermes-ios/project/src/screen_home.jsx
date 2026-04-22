// Home — a dashboard that frames the agent's "aliveness"
function ScreenHome({ go, user = "Maya" }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 30000); return () => clearInterval(t); }, []);

  const hour = time.getHours();
  const greet = hour < 5 ? "Still up" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const recent = [
    { id: "r1", text: "Ranked 4 flat listings for you", time: "2h", skill: "apartment-scorer" },
    { id: "r2", text: "Morning brief delivered via Telegram", time: "today · 7:00", skill: "morning-brief" },
    { id: "r3", text: "Drafted a reply to David about the rehearsal", time: "yesterday", skill: null },
  ];

  return (
    <div className="home">
      <div className="home-head">
        <div className="home-kicker">
          <span className="k-dot" />
          <span>Awake on dusk-vm · Lisbon</span>
        </div>
        <div className="home-hello">
          <h1>{greet}, <em>{user}</em>.</h1>
          <p>I did three things overnight and I'm watching two more.</p>
        </div>
      </div>

      <div className="home-scroll">
        <div className="home-card primary" onClick={() => go("chat")}>
          <div className="hc-row">
            <div className="hc-title">Continue our chat</div>
            <Icon.chev width="18" height="18" />
          </div>
          <div className="hc-preview">"Ranked. The top three are in Graça, Anjos, and Alvalade. Shall I email the agents?"</div>
          <div className="hc-foot">
            <span className="mini-mark" style={{color: "var(--accent)"}}><HermesMark size={14}/></span>
            <span>9:03 · awaiting your reply</span>
          </div>
        </div>

        <div className="home-grid">
          <button className="tile" onClick={() => go("skills")}>
            <div className="tile-head"><Icon.skills width="18" height="18"/><span>Skills</span></div>
            <div className="tile-num">12</div>
            <div className="tile-sub">2 new this week</div>
          </button>
          <button className="tile" onClick={() => go("memory")}>
            <div className="tile-head"><Icon.memory width="18" height="18"/><span>Memory</span></div>
            <div className="tile-num">47</div>
            <div className="tile-sub">entries about you</div>
          </button>
          <button className="tile" onClick={() => go("schedules")}>
            <div className="tile-head"><Icon.clock width="18" height="18"/><span>Schedules</span></div>
            <div className="tile-num">5</div>
            <div className="tile-sub">next at 7:00 tomorrow</div>
          </button>
          <button className="tile" onClick={() => go("subagents")}>
            <div className="tile-head"><Icon.branch width="18" height="18"/><span>Subagents</span></div>
            <div className="tile-num live">2</div>
            <div className="tile-sub">working right now</div>
          </button>
        </div>

        <div className="home-section">
          <div className="hs-head">
            <span>Recently</span>
            <button className="hs-link" onClick={() => go("chat")}>See all</button>
          </div>
          <div className="hs-list">
            {recent.map(r => (
              <div key={r.id} className="recent">
                <div className="rc-mark"><HermesMark size={12}/></div>
                <div className="rc-body">
                  <div className="rc-text">{r.text}</div>
                  <div className="rc-foot">
                    {r.skill && <span className="rc-skill">{r.skill}</span>}
                    <span>{r.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="home-section">
          <div className="hs-head"><span>I learned something new</span></div>
          <div className="learned">
            <div className="learned-top">
              <Icon.spark width="14" height="14"/>
              <span>New skill · Apartment scorer</span>
            </div>
            <p>After our last three search sessions I noticed you always break ties the same way: balcony &gt; dishwasher &gt; under 30 min to work. I saved that as its own skill so I don't have to ask.</p>
            <div className="learned-actions">
              <button className="ghost-btn" onClick={() => go("skills")}>View skill</button>
              <button className="ghost-btn">Edit rules</button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .home { flex: 1; display: flex; flex-direction: column; min-height: 0; }
        .home-head { padding: 4px 24px 12px; }
        .home-kicker { display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; color: var(--text-mute); }
        .k-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--good); box-shadow: 0 0 0 3px oklch(0.78 0.13 150 / 0.18); }
        .home-hello h1 { font-family: var(--font-serif); font-weight: 400; font-size: 32px; line-height: 1.2; letter-spacing: -0.01em; margin: 16px 0 12px; }
        .home-hello h1 em { color: var(--accent); font-style: italic; }
        .home-hello p { color: var(--text-dim); margin: 0; font-size: 14px; max-width: 30ch; line-height: 1.5; }

        .home-scroll { flex: 1; overflow-y: auto; padding: 20px 20px 16px; display: flex; flex-direction: column; gap: 20px; min-height: 0; }

        .home-card.primary {
          background: linear-gradient(135deg, oklch(0.78 0.14 var(--accent-h) / 0.16), oklch(0.78 0.14 var(--accent-h) / 0.05));
          border: 1px solid oklch(0.78 0.14 var(--accent-h) / 0.4);
          padding: 18px; border-radius: 20px; cursor: pointer;
        }
        .hc-row { display: flex; justify-content: space-between; align-items: center; color: var(--accent); font-size: 13px; font-weight: 500; font-family: var(--font-mono); letter-spacing: 0.02em; }
        .hc-preview { font-family: var(--font-serif); font-size: 19px; line-height: 1.35; margin: 10px 0 16px; color: var(--text); }
        .hc-foot { display: flex; align-items: center; gap: 8px; color: var(--text-mute); font-size: 12px; }

        .home-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .tile { background: var(--surface); border: 1px solid var(--line-soft); border-radius: 18px; padding: 16px; text-align: left; cursor: pointer; color: var(--text); display: flex; flex-direction: column; gap: 8px; }
        .tile:active { transform: scale(0.99); }
        .tile-head { display: flex; align-items: center; gap: 6px; color: var(--text-dim); font-size: 12px; font-weight: 500; }
        .tile-num { font-family: var(--font-serif); font-size: 36px; line-height: 1; font-weight: 400; }
        .tile-num.live { color: var(--accent); position: relative; }
        .tile-num.live::after { content: ""; position: absolute; top: 6px; right: -12px; width: 8px; height: 8px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 3px oklch(0.78 0.14 var(--accent-h) / 0.2); animation: pulse 1.8s ease-in-out infinite; }
        @keyframes pulse { 50% { opacity: 0.5; } }
        .tile-sub { color: var(--text-mute); font-size: 11.5px; font-family: var(--font-mono); }

        .home-section { display: flex; flex-direction: column; gap: 10px; }
        .hs-head { display: flex; justify-content: space-between; align-items: baseline; color: var(--text-mute); font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; }
        .hs-link { background: transparent; border: 0; color: var(--accent); font-size: 12px; cursor: pointer; }

        .hs-list { display: flex; flex-direction: column; background: var(--surface); border: 1px solid var(--line-soft); border-radius: 16px; overflow: hidden; }
        .recent { display: flex; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--line-soft); }
        .recent:last-child { border-bottom: 0; }
        .rc-mark { color: var(--accent); padding-top: 3px; }
        .rc-body { flex: 1; }
        .rc-text { font-size: 14px; line-height: 1.35; }
        .rc-foot { display: flex; gap: 10px; align-items: center; color: var(--text-mute); font-size: 11px; margin-top: 4px; font-family: var(--font-mono); }
        .rc-skill { color: var(--accent); }

        .learned { background: var(--surface); border: 1px solid var(--line-soft); border-radius: 16px; padding: 16px; }
        .learned-top { display: flex; align-items: center; gap: 6px; color: var(--accent); font-size: 11.5px; font-family: var(--font-mono); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px; }
        .learned p { margin: 0 0 14px; color: var(--text-dim); font-size: 13.5px; line-height: 1.55; }
        .learned-actions { display: flex; gap: 8px; }
        .ghost-btn { padding: 8px 12px; background: transparent; border: 1px solid var(--line); color: var(--text); border-radius: 10px; font-size: 12.5px; cursor: pointer; font-family: inherit; }
        .ghost-btn:first-child { background: var(--accent-soft); border-color: transparent; color: var(--accent); }
      `}</style>
    </div>
  );
}

window.ScreenHome = ScreenHome;
