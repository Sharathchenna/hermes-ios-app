// App shell — presents all 8 phones in a grid, with tab nav inside each, plus tweaks panel

function App() {
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem("hermes_ob") === "1");
  const [focus, setFocus] = useState(() => localStorage.getItem("hermes_focus") || "all");
  const [accentH, setAccentH] = useState(() => Number(localStorage.getItem("hermes_accent") || 55));
  const [density, setDensity] = useState(() => localStorage.getItem("hermes_density") || "comfortable");
  const [tweaksOpen, setTweaksOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent-h", accentH);
    localStorage.setItem("hermes_accent", accentH);
  }, [accentH]);
  useEffect(() => { localStorage.setItem("hermes_density", density); }, [density]);
  useEffect(() => { localStorage.setItem("hermes_focus", focus); }, [focus]);
  useEffect(() => { localStorage.setItem("hermes_ob", onboarded ? "1" : "0"); }, [onboarded]);

  // --- Tweaks protocol ---
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "__activate_edit_mode") setTweaksOpen(true);
      if (e.data?.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({type: "__edit_mode_available"}, "*");
    return () => window.removeEventListener("message", handler);
  }, []);

  const tweak = (patch) => {
    window.parent.postMessage({type: "__edit_mode_set_keys", edits: patch}, "*");
  };

  // Inner tab nav state for each phone is independent — we store per phone
  const screens = [
    { id: "onboarding", label: "01 Onboarding", render: () => <ScreenOnboarding onDone={() => setOnboarded(true)}/> },
    { id: "home", label: "02 Home", render: (goInner) => <HomeWithTabs goInner={goInner}/>  },
    { id: "chat", label: "03 Chat", render: () => <ChatWithTabs/> },
    { id: "skills", label: "04 Skills", render: () => <SkillsWithTabs/> },
    { id: "memory", label: "05 Memory", render: () => <MemoryWithTabs/> },
    { id: "schedules", label: "06 Schedules", render: () => <SchedulesWithTabs/> },
    { id: "subagents", label: "07 Subagents", render: () => <SubagentsWithTabs/> },
    { id: "settings", label: "08 Settings", render: () => <SettingsWithTabs accentH={accentH} setAccentH={setAccentH} density={density} setDensity={setDensity}/> },
  ];

  const visible = focus === "all" ? screens : screens.filter(s => s.id === focus);

  return (
    <div className="canvas" data-density={density}>
      <div className="canvas-head">
        <div className="ch-mark" style={{color: "var(--accent)"}}><HermesMark size={22}/></div>
        <div>
          <h1>Hermes <em>·</em> iOS</h1>
          <p>8 screens for the agent that grows with you. Try typing in Chat.</p>
        </div>
      </div>

      <div className="grid">
        {visible.map(s => (
          <div key={s.id} data-screen-label={s.label}>
            <Phone label={s.label}>{s.render()}</Phone>
          </div>
        ))}
      </div>

      {tweaksOpen && (
        <div className="tweaks">
          <div className="tw-head">Tweaks</div>
          <div className="tw-body">
            <label>Focus screen</label>
            <select value={focus} onChange={e => setFocus(e.target.value)}>
              <option value="all">All 8</option>
              {screens.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>

            <label>Accent hue</label>
            <div className="acc-row">
              {[55,30,200,280,140,15].map(h => (
                <button key={h} className="acc" data-on={accentH===h} onClick={() => { setAccentH(h); tweak({accentH: h}); }} style={{background:`oklch(0.78 0.14 ${h})`}}/>
              ))}
            </div>

            <label>Density</label>
            <div className="seg2">
              {["compact","comfortable"].map(d => (
                <button key={d} data-on={density===d} onClick={() => { setDensity(d); tweak({density: d}); }}>{d}</button>
              ))}
            </div>

            <label>Restart onboarding</label>
            <button className="tw-btn" onClick={() => setOnboarded(false)}>Show onboarding again</button>
          </div>
        </div>
      )}

      <style>{`
        .canvas { max-width: 1800px; margin: 0 auto; }
        .canvas-head { display: flex; gap: 14px; align-items: center; padding: 0 24px 24px; }
        .canvas-head h1 { font-family: var(--font-serif); font-weight: 400; font-size: 32px; margin: 0; letter-spacing: -0.01em; color: var(--text); }
        .canvas-head h1 em { color: var(--accent); font-style: normal; font-family: var(--font-mono); font-size: 20px; }
        .canvas-head p { color: var(--text-mute); margin: 4px 0 0; font-size: 13px; }

        .grid { display: grid; grid-template-columns: repeat(auto-fit, 390px); gap: 40px 28px; justify-content: center; padding-bottom: 60px; }

        .canvas[data-density="compact"] .phone { transform: scale(0.85); transform-origin: top center; }

        .tweaks { position: fixed; bottom: 20px; right: 20px; width: 280px; background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 14px; z-index: 50; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
        .tw-head { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; }
        .tw-body { display: flex; flex-direction: column; gap: 6px; }
        .tw-body label { font-size: 11px; color: var(--text-mute); margin-top: 8px; font-family: var(--font-mono); letter-spacing: 0.05em; text-transform: uppercase; }
        .tw-body select, .tw-btn { background: var(--bg-2); border: 1px solid var(--line); color: var(--text); padding: 8px; border-radius: 8px; font-family: inherit; font-size: 13px; cursor: pointer; }
        .acc-row { display: flex; gap: 8px; }
        .acc { width: 26px; height: 26px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; }
        .acc[data-on="true"] { border-color: var(--text); }
        .seg2 { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; background: var(--bg-2); border-radius: 8px; padding: 3px; gap: 3px; }
        .seg2 button { background: transparent; border: 0; padding: 6px; color: var(--text-mute); cursor: pointer; font-size: 12px; border-radius: 6px; text-transform: capitalize; font-family: inherit; }
        .seg2 button[data-on="true"] { background: var(--surface); color: var(--text); }
      `}</style>
    </div>
  );
}

// Each phone also shows tab bar, so it feels like one app; tab clicks switch inner screens.
function PhoneWithTabs({ startTab, children }) {
  const [tab, setTab] = useState(startTab);
  const body = (
    tab === "home" ? <ScreenHome go={(id) => setTab(id)}/> :
    tab === "chat" ? <ScreenChat onOpenSkill={(id) => setTab(id)}/> :
    tab === "skills" ? <ScreenSkills/> :
    tab === "memory" ? <ScreenMemory/> :
    tab === "schedules" ? <ScreenSchedules/> :
    tab === "subagents" ? <ScreenSubagents/> :
    tab === "settings" ? <ScreenSettings accentH={55} setAccentH={()=>{}} density="comfortable" setDensity={()=>{}}/> :
    children
  );
  // For tabs not in the primary 5, show the four-tab bar but highlight 'nothing'
  const primaryTabs = ["home","chat","skills","memory","settings"];
  const barCurrent = primaryTabs.includes(tab) ? tab : "home";
  return (
    <>
      {body}
      <TabBar current={barCurrent} onChange={setTab}/>
    </>
  );
}

function HomeWithTabs() { return <PhoneWithTabs startTab="home"/>; }
function ChatWithTabs() { return <PhoneWithTabs startTab="chat"/>; }
function SkillsWithTabs() { return <PhoneWithTabs startTab="skills"/>; }
function MemoryWithTabs() { return <PhoneWithTabs startTab="memory"/>; }
function SchedulesWithTabs() { return <PhoneWithTabs startTab="schedules"/>; }
function SubagentsWithTabs() { return <PhoneWithTabs startTab="subagents"/>; }
function SettingsWithTabs({ accentH, setAccentH, density, setDensity }) {
  const [tab, setTab] = useState("settings");
  const body = tab === "settings"
    ? <ScreenSettings accentH={accentH} setAccentH={setAccentH} density={density} setDensity={setDensity}/>
    : tab === "home" ? <ScreenHome go={setTab}/>
    : tab === "chat" ? <ScreenChat/>
    : tab === "skills" ? <ScreenSkills/>
    : tab === "memory" ? <ScreenMemory/>
    : <ScreenHome go={setTab}/>;
  return (<>{body}<TabBar current={tab === "settings" ? "settings" : tab} onChange={setTab}/></>);
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
