// Skills — browse, search, inspect. Modal detail view.
function ScreenSkills() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(null);

  const filtered = SKILLS.filter(s => {
    if (filter === "auto" && !s.auto) return false;
    if (filter === "mine" && s.auto) return false;
    if (q && !(s.name + s.desc + s.category).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="skills">
      <div className="sk-head">
        <div>
          <div className="sk-kicker">Skills · 12</div>
          <h1>What I can do</h1>
          <p>I wrote nine of these myself. Tap any to see how I'd approach it.</p>
        </div>
      </div>

      <div className="sk-search">
        <Icon.search width="16" height="16"/>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search skills"/>
      </div>

      <div className="sk-filters">
        {[["all","All"],["auto","Self-learned"],["mine","I wrote"]].map(([id, label]) => (
          <button key={id} className="sk-filter" data-on={filter===id} onClick={() => setFilter(id)}>{label}</button>
        ))}
      </div>

      <div className="sk-list">
        {filtered.map(s => (
          <button key={s.id} className="skill" onClick={() => setOpen(s)}>
            <div className="sk-top">
              <div className="sk-cat">{s.category}</div>
              {s.auto && <span className="sk-auto"><Icon.spark width="10" height="10"/> self-learned</span>}
            </div>
            <div className="sk-name">{s.name}</div>
            <div className="sk-desc">{s.desc}</div>
            <div className="sk-stats">
              <span><strong>{s.uses}</strong> uses</span>
              <span><strong>v{s.improved}</strong> revisions</span>
              <span>{s.learned}</span>
            </div>
            <div className="sk-conf">
              <div className="conf-bar"><div style={{width: `${s.confidence*100}%`}}/></div>
              <span>{Math.round(s.confidence*100)}%</span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <div className="sk-empty">No skills match "{q}".</div>}
      </div>

      {open && <SkillDetail s={open} onClose={() => setOpen(null)}/>}

      <style>{`
        .skills { flex: 1; display: flex; flex-direction: column; min-height: 0; }
        .sk-head { padding: 0 24px 12px; }
        .sk-kicker { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); }
        .sk-head h1 { font-family: var(--font-serif); font-weight: 400; font-size: 30px; margin: 6px 0 4px; letter-spacing: -0.01em; }
        .sk-head p { color: var(--text-dim); margin: 0; font-size: 13.5px; line-height: 1.4; }

        .sk-search { margin: 4px 20px 8px; display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: var(--surface); border: 1px solid var(--line-soft); border-radius: 12px; color: var(--text-mute); }
        .sk-search input { flex: 1; background: transparent; border: 0; outline: 0; color: var(--text); font-size: 14px; }

        .sk-filters { display: flex; gap: 6px; padding: 0 20px 12px; }
        .sk-filter { padding: 6px 12px; background: transparent; border: 1px solid var(--line); color: var(--text-dim); border-radius: 999px; font-size: 12.5px; cursor: pointer; font-family: inherit; }
        .sk-filter[data-on="true"] { background: var(--accent); color: #1a1208; border-color: var(--accent); font-weight: 500; }

        .sk-list { flex: 1; overflow-y: auto; padding: 0 16px 16px; display: flex; flex-direction: column; gap: 10px; min-height: 0; }
        .skill { background: var(--surface); border: 1px solid var(--line-soft); border-radius: 18px; padding: 16px; text-align: left; cursor: pointer; color: var(--text); display: flex; flex-direction: column; gap: 6px; }
        .skill:active { transform: scale(0.995); }
        .sk-top { display: flex; justify-content: space-between; align-items: center; }
        .sk-cat { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-mute); }
        .sk-auto { display: inline-flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 10px; color: var(--accent); letter-spacing: 0.05em; text-transform: uppercase; padding: 3px 7px; background: var(--accent-soft); border-radius: 999px; }
        .sk-name { font-family: var(--font-serif); font-size: 20px; line-height: 1.15; margin: 2px 0; }
        .sk-desc { color: var(--text-dim); font-size: 13px; line-height: 1.45; margin-bottom: 6px; }
        .sk-stats { display: flex; gap: 14px; font-family: var(--font-mono); font-size: 11px; color: var(--text-mute); }
        .sk-stats strong { color: var(--text); font-weight: 500; }
        .sk-conf { display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 10px; color: var(--text-mute); margin-top: 4px; }
        .conf-bar { flex: 1; height: 3px; background: var(--line); border-radius: 2px; overflow: hidden; }
        .conf-bar > div { height: 100%; background: var(--accent); border-radius: 2px; }

        .sk-empty { padding: 40px 20px; text-align: center; color: var(--text-mute); font-size: 13px; }
      `}</style>
    </div>
  );
}

function SkillDetail({ s, onClose }) {
  return (
    <div className="skd-scrim" onClick={onClose}>
      <div className="skd" onClick={e => e.stopPropagation()}>
        <div className="skd-grip"/>
        <div className="skd-head">
          <div>
            <div className="sk-cat">{s.category}</div>
            <h2>{s.name}</h2>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon.x width="20" height="20"/></button>
        </div>
        <p className="skd-desc">{s.desc}</p>

        <div className="skd-section">
          <div className="skd-label">How I approach it</div>
          <ol className="skd-steps">
            <li>Load context from <em>USER.md</em> and prior similar tasks</li>
            <li>Fan out: {s.tools.map(t => <code key={t}>{t}</code>).reduce((a, b) => [a, " ", b])}</li>
            <li>Score against your revealed preferences</li>
            <li>Return shortest useful answer; ask only if ambiguous</li>
          </ol>
        </div>

        <div className="skd-section">
          <div className="skd-label">Revisions</div>
          <div className="skd-rev">
            <div><strong>v{s.improved}</strong> <span>last week</span></div>
            <p>Started also checking 30-day rent trend after you corrected me twice.</p>
          </div>
          <div className="skd-rev">
            <div><strong>v{Math.max(s.improved-1,1)}</strong> <span>1 month ago</span></div>
            <p>Added balcony as a soft requirement.</p>
          </div>
        </div>

        <div className="skd-foot">
          <button className="ghost-btn">Edit rules</button>
          <button className="btn-primary" style={{width: "auto", flex: 1}}>Run now <Icon.chev width="16" height="16"/></button>
        </div>
      </div>

      <style>{`
        .skd-scrim { position: absolute; inset: 0; background: rgba(0,0,0,0.5); z-index: 20; display: flex; align-items: flex-end; animation: fadein 0.2s; }
        @keyframes fadein { from { opacity: 0; } }
        .skd { width: 100%; max-height: 80%; background: var(--bg-2); border-radius: 28px 28px 0 0; padding: 8px 22px 22px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; animation: slideup 0.25s ease-out; }
        @keyframes slideup { from { transform: translateY(40px); } }
        .skd-grip { width: 40px; height: 4px; background: var(--line); border-radius: 2px; margin: 6px auto 4px; }
        .skd-head { display: flex; justify-content: space-between; align-items: flex-start; }
        .skd-head h2 { font-family: var(--font-serif); font-weight: 400; font-size: 26px; margin: 4px 0 0; letter-spacing: -0.01em; }
        .skd-desc { color: var(--text-dim); margin: 0; font-size: 14px; line-height: 1.5; }
        .skd-section { border-top: 1px solid var(--line-soft); padding-top: 14px; }
        .skd-label { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-mute); margin-bottom: 10px; }
        .skd-steps { margin: 0; padding-left: 22px; color: var(--text); font-size: 14px; line-height: 1.7; }
        .skd-steps code { font-family: var(--font-mono); font-size: 12px; background: var(--surface); padding: 2px 6px; border-radius: 6px; color: var(--accent); }
        .skd-rev { margin-bottom: 10px; }
        .skd-rev > div { display: flex; gap: 10px; align-items: baseline; font-size: 13px; }
        .skd-rev strong { color: var(--accent); font-weight: 500; }
        .skd-rev span { color: var(--text-mute); font-family: var(--font-mono); font-size: 11px; }
        .skd-rev p { margin: 4px 0 0; color: var(--text-dim); font-size: 13px; line-height: 1.5; }
        .skd-foot { display: flex; gap: 10px; margin-top: 6px; }
      `}</style>
    </div>
  );
}

window.ScreenSkills = ScreenSkills;
