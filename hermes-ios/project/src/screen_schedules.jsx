// Schedules — natural language cron
function ScreenSchedules() {
  const [items, setItems] = useState(SCHEDULES);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");
  const [parsed, setParsed] = useState(null);

  const toggle = (id) => setItems(items.map(x => x.id === id ? { ...x, status: x.status === "on" ? "paused" : "on" } : x));

  // fake parser for nl cron
  const parseDraft = (t) => {
    const s = t.toLowerCase();
    if (!s) return null;
    let when = "Every day at 9:00";
    if (/morning/.test(s)) when = "Every weekday at 7:00";
    else if (/friday|fri/.test(s)) when = "Fridays at 16:00";
    else if (/monday|week/.test(s)) when = "Mondays at 10:00";
    else if (/hour/.test(s)) when = "Every 4 hours";
    else if (/month/.test(s)) when = "Monthly, 1st at 9:00";
    const name = t.replace(/^(every|each|on|send me|remind me to|at)\s+/i, "").slice(0, 40);
    return { name: name.charAt(0).toUpperCase() + name.slice(1), cron: when };
  };

  const handleDraft = (t) => { setDraft(t); setParsed(parseDraft(t)); };
  const confirm = () => {
    if (!parsed) return;
    setItems([{ id: "new" + Date.now(), name: parsed.name, cron: parsed.cron, next: "Soon", last: "—", status: "on", skill: null, destination: "Push" }, ...items]);
    setComposing(false); setDraft(""); setParsed(null);
  };

  return (
    <div className="sch">
      <div className="sch-head">
        <div>
          <div className="sk-kicker">Automations · 5</div>
          <h1>Things I do <em>on a beat</em></h1>
        </div>
        <button className="sk-add" onClick={() => setComposing(true)} style={{alignSelf: "flex-end"}}><Icon.plus width="14" height="14"/></button>
      </div>

      <div className="sch-list">
        {items.map(x => (
          <div key={x.id} className="sch-item" data-status={x.status}>
            <div className="sch-top">
              <div className="sch-name">{x.name}</div>
              <button className="switch-sm" data-on={x.status === "on"} onClick={() => toggle(x.id)}><div/></button>
            </div>
            <div className="sch-cron">{x.cron}</div>
            <div className="sch-meta">
              <span className="via"><Icon.clock width="11" height="11"/> next {x.next}</span>
              <span>→ {x.destination}</span>
              {x.skill && <span className="via-skill">uses <code>{x.skill}</code></span>}
            </div>
          </div>
        ))}
      </div>

      {composing && (
        <div className="skd-scrim" onClick={() => setComposing(false)}>
          <div className="skd" onClick={e => e.stopPropagation()}>
            <div className="skd-grip"/>
            <h2 style={{fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 26, margin: "4px 0 6px"}}>New schedule</h2>
            <p style={{color: "var(--text-dim)", fontSize: 13.5, margin: "0 0 14px"}}>Say it like you mean it. I'll figure out the cron.</p>
            <textarea className="mem-input" rows="2" value={draft} onChange={e => handleDraft(e.target.value)}
              placeholder="e.g. remind me every Friday afternoon to write the newsletter" autoFocus/>
            {parsed && (
              <div className="parsed">
                <div className="parsed-label">I heard</div>
                <div className="parsed-line"><span className="tk">name</span> <span>{parsed.name}</span></div>
                <div className="parsed-line"><span className="tk">when</span> <span>{parsed.cron}</span></div>
                <div className="parsed-line"><span className="tk">deliver</span> <span>Push notification</span></div>
              </div>
            )}
            <div className="skd-foot">
              <button className="ghost-btn" onClick={() => setComposing(false)}>Cancel</button>
              <button className="btn-primary" style={{width: "auto", flex: 1}} disabled={!parsed} onClick={confirm}>Schedule it</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sch { flex: 1; display: flex; flex-direction: column; min-height: 0; }
        .sch-head { padding: 0 24px 14px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .sch-head h1 { font-family: var(--font-serif); font-weight: 400; font-size: 30px; margin: 6px 0 0; line-height: 1.1; letter-spacing: -0.01em; }
        .sch-head h1 em { color: var(--accent); font-style: italic; }

        .sch-list { flex: 1; overflow-y: auto; padding: 0 16px 16px; display: flex; flex-direction: column; gap: 10px; min-height: 0; }
        .sch-item { background: var(--surface); border: 1px solid var(--line-soft); border-radius: 16px; padding: 14px 16px; }
        .sch-item[data-status="paused"] { opacity: 0.55; }
        .sch-top { display: flex; justify-content: space-between; align-items: center; }
        .sch-name { font-size: 15px; font-weight: 500; }
        .sch-cron { font-family: var(--font-mono); font-size: 12px; color: var(--accent); margin: 6px 0 8px; }
        .sch-meta { display: flex; flex-wrap: wrap; gap: 10px; font-family: var(--font-mono); font-size: 11px; color: var(--text-mute); }
        .sch-meta .via { display: inline-flex; align-items: center; gap: 4px; }
        .sch-meta code { color: var(--text); background: var(--bg-2); padding: 1px 5px; border-radius: 4px; }

        .switch-sm { width: 36px; height: 22px; background: var(--line); border: 0; border-radius: 999px; position: relative; cursor: pointer; padding: 0; transition: background 0.2s; }
        .switch-sm > div { width: 18px; height: 18px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: transform 0.2s; }
        .switch-sm[data-on="true"] { background: var(--accent); }
        .switch-sm[data-on="true"] > div { transform: translateX(14px); }

        .parsed { margin-top: 12px; padding: 12px; background: var(--bg-2); border: 1px dashed var(--accent); border-radius: 12px; font-family: var(--font-mono); font-size: 12px; }
        .parsed-label { color: var(--accent); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px; }
        .parsed-line { display: flex; gap: 10px; padding: 3px 0; }
        .parsed-line .tk { color: var(--text-mute); width: 60px; }
        .parsed-line span:last-child { color: var(--text); }
      `}</style>
    </div>
  );
}

window.ScreenSchedules = ScreenSchedules;
