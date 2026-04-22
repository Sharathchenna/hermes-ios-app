const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;

// -------- Phone shell (no bezel — just the screen + safe areas) --------
function Phone({ children, label, dark = true }) {
  return (
    <div className="phone-wrap">
      <div className="phone-label">{label}</div>
      <div className="phone">
        <StatusBar />
        <div className="phone-body">{children}</div>
        <HomeIndicator />
      </div>
    </div>
  );
}

function StatusBar({ tone = "light" }) {
  return (
    <div className="statusbar" data-tone={tone}>
      <div className="sb-time">9:41</div>
      <div className="sb-right">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none"><path d="M1 6c2-2 5-2 7 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M4 8.5c1-1 3-1 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="6" cy="10" r="0.9" fill="currentColor"/><path d="M11 2v8M13 4v6M15 6v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        <svg width="24" height="11" viewBox="0 0 24 11" fill="none"><rect x="0.5" y="0.5" width="20" height="10" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="15" height="7" rx="1.2" fill="currentColor"/><rect x="21.5" y="4" width="1.5" height="3" rx="0.6" fill="currentColor" opacity="0.5"/></svg>
      </div>
    </div>
  );
}

function HomeIndicator() {
  return <div className="home-indicator"><div /></div>;
}

// -------- Brand mark: a learning-loop arc --------
function HermesMark({ size = 28, spin = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ display: "block" }} className={spin ? "mark-spin" : ""}>
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.4"/>
      <path d="M16 3 A13 13 0 0 1 29 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="16" cy="3" r="2.2" fill="currentColor"/>
      <circle cx="16" cy="16" r="3" fill="currentColor"/>
    </svg>
  );
}

// -------- Icons (hand-rolled, single stroke) --------
const Icon = {
  chat: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8A2.5 2.5 0 0 1 17.5 17H10l-4 3v-3h-.5A1.5 1.5 0 0 1 4 15.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>),
  home: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><path d="M4 11l8-6 8 6v8a2 2 0 0 1-2 2h-3v-5h-6v5H6a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>),
  skills: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><path d="M4 7l8-4 8 4-8 4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M4 12l8 4 8-4M4 17l8 4 8-4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" opacity="0.55"/></svg>),
  memory: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><path d="M12 3a5 5 0 0 0-5 5c0 1.3-.6 2-1.5 2.8A3 3 0 0 0 7 16v3a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3a3 3 0 0 0 1.5-5.2C17.6 10 17 9.3 17 8a5 5 0 0 0-5-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M9 13h6M10 17h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  clock: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6"/><path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  branch: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><circle cx="6" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.6"/><circle cx="6" cy="19" r="2.2" stroke="currentColor" strokeWidth="1.6"/><circle cx="18" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.6"/><path d="M6 7.5v9M8 19c4 0 8-1 8-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  settings: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  send: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><path d="M4 12l16-8-6 17-3-7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>),
  plus: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>),
  back: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><path d="M14 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  check: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  spark: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><path d="M12 3l1.7 5.1L19 10l-5.3 1.9L12 17l-1.7-5.1L5 10l5.3-1.9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>),
  search: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6"/><path d="M20 20l-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>),
  terminal: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M7 10l3 2-3 2M12 15h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  web: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6"/><path d="M3.5 12h17M12 3.5c2.5 2.5 4 5.5 4 8.5s-1.5 6-4 8.5M12 3.5c-2.5 2.5-4 5.5-4 8.5s1.5 6 4 8.5" stroke="currentColor" strokeWidth="1.6"/></svg>),
  code: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><path d="M9 8l-5 4 5 4M15 8l5 4-5 4M13 6l-2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  file: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>),
  bolt: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><path d="M13 3L5 14h6l-1 7 8-11h-6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>),
  dots: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/></svg>),
  pause: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><rect x="7" y="5" width="3" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="3" height="14" rx="1" fill="currentColor"/></svg>),
  play: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><path d="M7 5l12 7-12 7z" fill="currentColor"/></svg>),
  x: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>),
  chev: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
};

// -------- Tab bar --------
function TabBar({ current, onChange }) {
  const tabs = [
    { id: "home", label: "Home", icon: Icon.home },
    { id: "chat", label: "Chat", icon: Icon.chat },
    { id: "skills", label: "Skills", icon: Icon.skills },
    { id: "memory", label: "Memory", icon: Icon.memory },
    { id: "settings", label: "You", icon: Icon.settings },
  ];
  return (
    <div className="tabbar">
      {tabs.map(t => {
        const I = t.icon;
        const active = t.id === current;
        return (
          <button key={t.id} className="tab" data-active={active} onClick={() => onChange(t.id)}>
            <I width="22" height="22" />
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// -------- Shared global styles injected once --------
const PRIMITIVE_STYLES = `
.phone-wrap { display: flex; flex-direction: column; align-items: center; }
.phone-label { color: var(--text-mute); font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px; }
.phone {
  width: 390px; height: 844px;
  background: var(--bg);
  border-radius: 44px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 40px 80px -30px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
  display: flex; flex-direction: column;
  color: var(--text);
}
.statusbar {
  height: 50px; padding: 18px 28px 0; display: flex; justify-content: space-between; align-items: center;
  color: var(--text); position: relative; z-index: 5;
  font-family: var(--font-sans); font-weight: 600; font-size: 15px;
}
.sb-right { display: flex; gap: 6px; align-items: center; }
.home-indicator { height: 28px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px; }
.home-indicator > div { width: 140px; height: 5px; border-radius: 3px; background: rgba(255,255,255,0.35); }
.phone-body { flex: 1; min-height: 0; display: flex; flex-direction: column; position: relative; }

.tabbar {
  display: grid; grid-template-columns: repeat(5, 1fr);
  padding: 8px 8px 0;
  border-top: 1px solid var(--line-soft);
  background: oklch(0.16 0.012 50 / 0.85);
  backdrop-filter: blur(20px);
}
.tab {
  background: transparent; border: 0; padding: 10px 4px; display: flex; flex-direction: column; gap: 3px;
  align-items: center; color: var(--text-mute); font-size: 10px; font-weight: 500; cursor: pointer;
  transition: color 0.15s;
}
.tab[data-active="true"] { color: var(--accent); }
.tab:active { transform: scale(0.96); }

.mark-spin { animation: mark-spin 8s linear infinite; }
@keyframes mark-spin { to { transform: rotate(360deg); } }

/* Scrollbars */
.phone ::-webkit-scrollbar { width: 0; height: 0; }
`;

(function injectStyles() {
  if (document.getElementById("primitives-css")) return;
  const s = document.createElement("style");
  s.id = "primitives-css";
  s.textContent = PRIMITIVE_STYLES;
  document.head.appendChild(s);
})();

Object.assign(window, { Phone, StatusBar, HomeIndicator, HermesMark, Icon, TabBar });
