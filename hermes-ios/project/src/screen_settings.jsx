// Settings — provider, connected platforms, backend, memory caps, theme, danger zone
function ScreenSettings({ accentH, setAccentH, density, setDensity }) {
  const [notifs, setNotifs] = useState(true);
  const [autoSkills, setAutoSkills] = useState(true);
  const [nudges, setNudges] = useState(true);

  return (
    <div className="set">
      <div className="set-head">
        <div className="avatar"><span>M</span></div>
        <div>
          <div className="set-name">Maya</div>
          <div className="set-sub">maya@hermes · Lisbon · since Jan 2026</div>
        </div>
      </div>

      <div className="set-scroll">
        <Group label="Model">
          <Row label="Primary provider" value="Nous Portal" meta="OAuth · claude-haiku-4-5"/>
          <Row label="Fallback" value="OpenRouter" meta="sonnet-4 · for hard tasks"/>
          <Row label="Monthly spend" value="$12.40" meta="budget $40 · on track"/>
        </Group>

        <Group label="Reach">
          <div className="platform-grid">
            {[
              { n: "Telegram", on: true },
              { n: "Discord", on: true },
              { n: "Slack", on: false },
              { n: "WhatsApp", on: true },
              { n: "Signal", on: false },
              { n: "Email", on: true },
            ].map(p => (
              <div key={p.n} className="plat-chip" data-on={p.on}>
                <span className="plat-dot"/>
                {p.n}
              </div>
            ))}
          </div>
        </Group>

        <Group label="Backend">
          <Row label="Runs on" value="dusk-vm · Daytona" meta="awake · $3/mo idle"/>
          <Row label="Region" value="eu-west"/>
        </Group>

        <Group label="Behavior">
          <Toggle label="Self-written skills" sub="Save reusable approaches automatically" on={autoSkills} onChange={setAutoSkills}/>
          <Toggle label="Memory nudges" sub="Ask me before updating what you know" on={nudges} onChange={setNudges}/>
          <Toggle label="Push notifications" on={notifs} onChange={setNotifs}/>
        </Group>

        <Group label="Appearance">
          <div className="set-sub-label">Accent</div>
          <div className="accent-row">
            {[55, 30, 200, 280, 140].map(h => (
              <button key={h} className="acc-swatch" data-on={accentH === h} onClick={() => setAccentH(h)}
                style={{background: `oklch(0.78 0.14 ${h})`}} aria-label={`accent ${h}`} />
            ))}
          </div>
          <div className="set-sub-label" style={{marginTop: 14}}>Density</div>
          <div className="seg">
            {["compact","comfortable"].map(d => (
              <button key={d} data-on={density === d} onClick={() => setDensity(d)}>{d}</button>
            ))}
          </div>
        </Group>

        <Group label="Danger zone" danger>
          <Row label="Export all memories" value=".md files"/>
          <Row label="Forget everything" value="irreversible" danger/>
        </Group>

        <div className="set-foot">
          <div style={{color: "var(--accent)"}}><HermesMark size={16}/></div>
          <span>Hermes iOS · build 0.4 · open source · MIT</span>
        </div>
      </div>

      <style>{`
        .set { flex: 1; display: flex; flex-direction: column; min-height: 0; }
        .set-head { display: flex; gap: 12px; align-items: center; padding: 0 24px 18px; }
        .avatar { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), oklch(0.55 0.18 var(--accent-h))); display: flex; align-items: center; justify-content: center; color: #1a1208; font-family: var(--font-serif); font-size: 26px; }
        .set-name { font-family: var(--font-serif); font-size: 22px; letter-spacing: -0.01em; }
        .set-sub { color: var(--text-mute); font-family: var(--font-mono); font-size: 11px; margin-top: 2px; }

        .set-scroll { flex: 1; overflow-y: auto; padding: 0 16px 16px; min-height: 0; display: flex; flex-direction: column; gap: 16px; }

        .group { }
        .group-label { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-mute); padding: 0 8px 8px; }
        .group-body { background: var(--surface); border: 1px solid var(--line-soft); border-radius: 14px; overflow: hidden; }
        .group[data-danger="true"] .group-label { color: var(--danger); }

        .row { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--line-soft); gap: 10px; }
        .row:last-child { border-bottom: 0; }
        .row-l { font-size: 14px; }
        .row-r { text-align: right; }
        .row-val { font-size: 14px; color: var(--text); }
        .row-meta { font-family: var(--font-mono); font-size: 11px; color: var(--text-mute); margin-top: 2px; }
        .row[data-danger="true"] .row-l { color: var(--danger); }

        .platform-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; padding: 10px; }
        .plat-chip { display: flex; align-items: center; gap: 6px; padding: 8px; font-size: 12px; color: var(--text-mute); border-radius: 8px; }
        .plat-chip[data-on="true"] { color: var(--text); }
        .plat-chip[data-on="true"] .plat-dot { background: var(--good); }

        .toggle { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--line-soft); gap: 16px; cursor: pointer; }
        .toggle:last-child { border-bottom: 0; }
        .toggle-main { font-size: 14px; }
        .toggle-sub { color: var(--text-mute); font-size: 12px; margin-top: 3px; line-height: 1.4; }

        .set-sub-label { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-mute); padding: 14px 16px 10px; }
        .accent-row { display: flex; gap: 10px; padding: 0 16px 14px; }
        .acc-swatch { width: 30px; height: 30px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; }
        .acc-swatch[data-on="true"] { border-color: var(--text); box-shadow: 0 0 0 2px var(--bg); }

        .seg { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; margin: 0 16px 14px; background: var(--bg-2); border-radius: 10px; padding: 3px; gap: 3px; }
        .seg button { background: transparent; border: 0; padding: 8px; color: var(--text-mute); cursor: pointer; font-size: 13px; border-radius: 8px; font-family: inherit; text-transform: capitalize; }
        .seg button[data-on="true"] { background: var(--surface); color: var(--text); }

        .set-foot { display: flex; align-items: center; gap: 8px; justify-content: center; color: var(--text-mute); font-family: var(--font-mono); font-size: 10.5px; padding: 18px 0 8px; }
      `}</style>
    </div>
  );
}

function Group({ label, children, danger }) {
  return (
    <div className="group" data-danger={!!danger}>
      <div className="group-label">{label}</div>
      <div className="group-body">{children}</div>
    </div>
  );
}

function Row({ label, value, meta, danger }) {
  return (
    <div className="row" data-danger={!!danger}>
      <div className="row-l">{label}</div>
      <div className="row-r">
        <div className="row-val">{value}</div>
        {meta && <div className="row-meta">{meta}</div>}
      </div>
    </div>
  );
}

function Toggle({ label, sub, on, onChange }) {
  return (
    <div className="toggle" onClick={() => onChange(!on)}>
      <div>
        <div className="toggle-main">{label}</div>
        {sub && <div className="toggle-sub">{sub}</div>}
      </div>
      <div className="switch" data-on={on}><div/></div>
    </div>
  );
}

window.ScreenSettings = ScreenSettings;
