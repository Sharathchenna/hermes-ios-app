// Memory — agent's file of what it knows about you. Editable with pencil.
function ScreenMemory() {
  const [items, setItems] = useState(MEMORIES);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const shown = items.filter(m => filter === "all" || m.kind === filter);

  const remove = (id) => setItems(items.filter(m => m.id !== id));
  const update = (id, text) => { setItems(items.map(m => m.id === id ? { ...m, text } : m)); setEditing(null); };

  return (
    <div className="mem">
      <div className="mem-head">
        <div className="sk-kicker">USER.md · PROJECTS.md</div>
        <h1>What I remember<br/><em>about you</em></h1>
        <p>Small, readable, editable. Nothing is secret from you. I'll ask before I add anything risky.</p>
      </div>

      <div className="mem-meters">
        <div className="meter">
          <div className="meter-label">USER.md</div>
          <div className="meter-bar"><div style={{width: "62%"}}/></div>
          <div className="meter-num">871 / 1,375 chars</div>
        </div>
        <div className="meter">
          <div className="meter-label">PROJECTS.md</div>
          <div className="meter-bar"><div style={{width: "48%"}}/></div>
          <div className="meter-num">1,056 / 2,200 chars</div>
        </div>
      </div>

      <div className="sk-filters" style={{padding: "4px 20px 10px"}}>
        {[["all","All"],["user","About you"],["project","Projects"]].map(([id, label]) => (
          <button key={id} className="sk-filter" data-on={filter===id} onClick={() => setFilter(id)}>{label}</button>
        ))}
        <button className="sk-add" onClick={() => setAddOpen(true)}><Icon.plus width="14" height="14"/></button>
      </div>

      <div className="mem-list">
        {shown.map(m => (
          <div key={m.id} className="mem-item" data-kind={m.kind}>
            <div className="mem-kind">— {m.kind === "user" ? "you" : "project"}</div>
            {editing === m.id ? (
              <EditEntry text={m.text} onSave={t => update(m.id, t)} onCancel={() => setEditing(null)} />
            ) : (
              <>
                <div className="mem-text">{m.text}</div>
                <div className="mem-foot">
                  <span>added {m.added}</span>
                  <span>·</span>
                  <span>confidence {Math.round(m.confidence * 100)}%</span>
                  <div className="mem-actions">
                    <button onClick={() => setEditing(m.id)}>Edit</button>
                    <button onClick={() => remove(m.id)}>Forget</button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {addOpen && (
        <div className="skd-scrim" onClick={() => setAddOpen(false)}>
          <div className="skd" onClick={e => e.stopPropagation()} style={{maxHeight: "auto"}}>
            <div className="skd-grip"/>
            <h2 style={{fontFamily: "var(--font-serif)", margin: "4px 0 12px", fontSize: 24, fontWeight: 400}}>Tell me something new</h2>
            <textarea className="mem-input" rows="3" placeholder="e.g. I prefer meetings after 11am."/>
            <div className="skd-foot">
              <button className="ghost-btn" onClick={() => setAddOpen(false)}>Cancel</button>
              <button className="btn-primary" style={{width: "auto", flex: 1}} onClick={() => setAddOpen(false)}>Remember this</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .mem { flex: 1; display: flex; flex-direction: column; min-height: 0; }
        .mem-head { padding: 0 24px 16px; }
        .mem-head h1 { font-family: var(--font-serif); font-weight: 400; font-size: 32px; margin: 6px 0 6px; line-height: 1.05; letter-spacing: -0.01em; }
        .mem-head h1 em { color: var(--accent); font-style: italic; }
        .mem-head p { color: var(--text-dim); margin: 0; font-size: 13.5px; line-height: 1.45; max-width: 32ch; }

        .mem-meters { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 0 20px 14px; }
        .meter { background: var(--surface); border: 1px solid var(--line-soft); border-radius: 14px; padding: 12px; }
        .meter-label { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-mute); }
        .meter-bar { height: 4px; background: var(--line); border-radius: 2px; margin: 8px 0 6px; overflow: hidden; }
        .meter-bar > div { height: 100%; background: var(--accent); border-radius: 2px; }
        .meter-num { font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); }

        .sk-add { margin-left: auto; width: 32px; height: 32px; padding: 0; background: var(--accent); color: #1a1208; border: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }

        .mem-list { flex: 1; overflow-y: auto; padding: 0 16px 16px; display: flex; flex-direction: column; gap: 8px; min-height: 0; }
        .mem-item { background: var(--surface); border: 1px solid var(--line-soft); border-left: 3px solid var(--line); border-radius: 14px; padding: 12px 14px 10px; font-family: var(--font-mono); font-size: 13px; }
        .mem-item[data-kind="user"] { border-left-color: var(--accent); }
        .mem-item[data-kind="project"] { border-left-color: oklch(0.68 0.1 200); }
        .mem-kind { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-mute); margin-bottom: 4px; }
        .mem-text { color: var(--text); line-height: 1.5; font-family: var(--font-sans); font-size: 14px; }
        .mem-foot { display: flex; gap: 6px; align-items: center; margin-top: 8px; color: var(--text-mute); font-size: 11px; }
        .mem-actions { margin-left: auto; display: flex; gap: 4px; }
        .mem-actions button { background: transparent; border: 0; color: var(--text-mute); font-size: 11px; padding: 4px 8px; cursor: pointer; font-family: inherit; border-radius: 6px; }
        .mem-actions button:hover { color: var(--accent); background: var(--accent-soft); }

        .mem-input { width: 100%; background: var(--surface); border: 1px solid var(--line); color: var(--text); padding: 12px; border-radius: 12px; font-size: 14px; font-family: inherit; outline: none; resize: none; }
        .mem-input:focus { border-color: var(--accent); }
      `}</style>
    </div>
  );
}

function EditEntry({ text, onSave, onCancel }) {
  const [val, setVal] = useState(text);
  return (
    <div>
      <textarea className="mem-input" rows="2" value={val} onChange={e => setVal(e.target.value)} autoFocus/>
      <div style={{display: "flex", gap: 6, marginTop: 8, justifyContent: "flex-end"}}>
        <button className="ghost-btn" onClick={onCancel}>Cancel</button>
        <button className="ghost-btn" style={{background: "var(--accent)", color: "#1a1208", borderColor: "transparent"}} onClick={() => onSave(val)}>Save</button>
      </div>
    </div>
  );
}

window.ScreenMemory = ScreenMemory;
