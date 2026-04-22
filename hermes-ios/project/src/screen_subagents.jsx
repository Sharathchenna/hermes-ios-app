// Subagents — isolated child runs with their own context
function ScreenSubagents() {
  const [items, setItems] = useState(SUBAGENTS);
  const [open, setOpen] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setTick(x => x + 1);
      setItems(cur => cur.map(x => x.status === "running" ? { ...x, progress: Math.min(1, x.progress + 0.005) } : x));
    }, 600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="sub">
      <div className="sch-head">
        <div>
          <div className="sk-kicker">Subagents · 4</div>
          <h1>My <em>helpers</em></h1>
          <p style={{color: "var(--text-dim)", fontSize: 13.5, margin: "4px 0 0", lineHeight: 1.45}}>Isolated runs with their own context. Zero cost to the main chat.</p>
        </div>
      </div>

      <div className="sub-list">
        {items.map(x => (
          <button key={x.id} className="sub-item" onClick={() => setOpen(x)} data-status={x.status}>
            <div className="sub-top">
              <span className={`dot status-${x.status}`}/>
              <span className="sub-status">{x.status}</span>
              <span className="sub-src">{x.spawned}</span>
            </div>
            <div className="sub-title">{x.title}</div>
            <div className="sub-bar"><div style={{width: `${x.progress*100}%`}}/></div>
            <div className="sub-meta">
              <span>{x.steps} steps</span>
              <span>·</span>
              <span>{(x.tokens/1000).toFixed(1)}k tokens</span>
              <span>·</span>
              <span>started {x.started}</span>
            </div>
          </button>
        ))}
      </div>

      {open && <SubDetail sa={open} onClose={() => setOpen(null)} tick={tick}/>}

      <style>{`
        .sub { flex: 1; display: flex; flex-direction: column; min-height: 0; }
        .sub-list { flex: 1; overflow-y: auto; padding: 0 16px 16px; display: flex; flex-direction: column; gap: 10px; min-height: 0; }
        .sub-item { text-align: left; background: var(--surface); border: 1px solid var(--line-soft); border-radius: 16px; padding: 14px 16px; cursor: pointer; color: var(--text); }
        .sub-item[data-status="done"] { opacity: 0.72; }
        .sub-item[data-status="paused"] { opacity: 0.6; }
        .sub-top { display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-mute); }
        .sub-status { color: var(--text-dim); }
        .sub-src { margin-left: auto; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-running { background: var(--accent); box-shadow: 0 0 0 3px oklch(0.78 0.14 var(--accent-h) / 0.2); animation: pulse 1.8s ease-in-out infinite; }
        .status-done { background: var(--good); }
        .status-paused { background: var(--text-mute); }
        .sub-title { font-family: var(--font-serif); font-size: 19px; margin: 8px 0; line-height: 1.25; }
        .sub-bar { height: 3px; background: var(--line); border-radius: 2px; overflow: hidden; }
        .sub-bar > div { height: 100%; background: var(--accent); border-radius: 2px; transition: width 0.5s; }
        .sub-meta { display: flex; gap: 6px; font-family: var(--font-mono); font-size: 11px; color: var(--text-mute); margin-top: 8px; }
      `}</style>
    </div>
  );
}

function SubDetail({ sa, onClose, tick }) {
  const log = [
    { t: "0s", kind: "sys", text: "subagent spawned · own context" },
    { t: "2s", kind: "tool", text: "web.search → competitors of Kestrel" },
    { t: "11s", kind: "tool", text: "web.extract × 6 pages" },
    { t: "34s", kind: "thought", text: "dedup · 4 unique · scoring by overlap with our features" },
    { t: "1m12s", kind: "tool", text: "file.write → research/competitors.md" },
    { t: "2m05s", kind: "thought", text: "looking at pricing pages" },
  ];
  const extra = Math.floor((tick % 20) / 5);
  return (
    <div className="skd-scrim" onClick={onClose}>
      <div className="skd" onClick={e => e.stopPropagation()}>
        <div className="skd-grip"/>
        <div className="skd-head">
          <div>
            <div className="sk-cat" style={{color: "var(--accent)"}}>{sa.status} · subagent</div>
            <h2>{sa.title}</h2>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon.x width="20" height="20"/></button>
        </div>

        <div className="skd-stats">
          <div><div className="lbl">Steps</div><div className="val">{sa.steps + (sa.status==="running" ? extra : 0)}</div></div>
          <div><div className="lbl">Tokens</div><div className="val">{(sa.tokens/1000).toFixed(1)}k</div></div>
          <div><div className="lbl">Progress</div><div className="val">{Math.round(sa.progress*100)}%</div></div>
        </div>

        <div className="skd-section">
          <div className="skd-label">Live trace</div>
          <div className="trace">
            {log.map((l, i) => (
              <div key={i} className={`tr tr-${l.kind}`}>
                <span className="tr-t">{l.t}</span>
                <span className="tr-text">{l.text}</span>
              </div>
            ))}
            {sa.status === "running" && <div className="tr tr-live"><span className="tr-t">now</span> <span className="tr-text">reading page 3/6 <span className="typing"><span/><span/><span/></span></span></div>}
          </div>
        </div>

        <div className="skd-foot">
          {sa.status === "running" ? (
            <>
              <button className="ghost-btn">Pause</button>
              <button className="ghost-btn" style={{background: "var(--danger)", color: "white", borderColor: "transparent"}}>Cancel</button>
            </>
          ) : (
            <button className="btn-primary" style={{width: "auto", flex: 1}}>View report <Icon.chev width="16" height="16"/></button>
          )}
        </div>
      </div>

      <style>{`
        .skd-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 4px 0 6px; }
        .skd-stats > div { background: var(--bg-2); border: 1px solid var(--line-soft); border-radius: 12px; padding: 10px; }
        .skd-stats .lbl { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-mute); }
        .skd-stats .val { font-family: var(--font-serif); font-size: 24px; margin-top: 4px; }
        .trace { display: flex; flex-direction: column; gap: 6px; font-family: var(--font-mono); font-size: 12px; }
        .tr { display: flex; gap: 12px; padding: 4px 0; }
        .tr-t { color: var(--text-mute); min-width: 54px; }
        .tr-sys .tr-text { color: var(--text-dim); }
        .tr-tool .tr-text { color: var(--accent); }
        .tr-thought .tr-text { color: var(--text-dim); font-style: italic; font-family: var(--font-serif); font-size: 13px; }
        .tr-live .tr-text { color: var(--text); }
      `}</style>
    </div>
  );
}

window.ScreenSubagents = ScreenSubagents;
