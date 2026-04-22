import { create } from 'zustand';

// ---------- Types ----------

export interface Skill {
  id: string;
  name: string;
  category: string;
  uses: number;
  improved: number;
  learned: string;
  auto: boolean;
  desc: string;
  tools: string[];
  confidence: number;
}

export interface Memory {
  id: string;
  kind: 'user' | 'project';
  text: string;
  confidence: number;
  added: string;
}

export interface Schedule {
  id: string;
  name: string;
  cron: string;
  next: string;
  last: string;
  status: 'on' | 'paused';
  skill: string | null;
  destination: string;
}

export interface Subagent {
  id: string;
  title: string;
  status: 'running' | 'done' | 'paused';
  progress: number;
  started: string;
  tokens: number;
  steps: number;
  spawned: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'hermes';
  text?: string;
  kind?: 'tool';
  tool?: string;
  args?: string;
  result?: string;
  duration?: string;
  opensSubagent?: boolean;
  ts?: string;
}

export interface PendingMessage {
  kind: 'typing' | 'thought' | 'stream';
  text: string;
}

// ---------- Mock Data ----------

const SKILLS: Skill[] = [
  { id: "trip-planner", name: "Trip Itinerary Planner", category: "Travel", uses: 14, improved: 3, learned: "2 weeks ago", auto: true, desc: "Three-pass planner: draft, critique timings, balance against budget. Learned on your Tokyo trip.", tools: ["web", "file"], confidence: 0.92 },
  { id: "pr-review", name: "PR Review Checklist", category: "Engineering", uses: 41, improved: 7, learned: "1 month ago", auto: true, desc: "Reads diff, flags missing tests, notes style inconsistencies against your team conventions.", tools: ["code", "terminal"], confidence: 0.88 },
  { id: "weekly-report", name: "Weekly Status Report", category: "Work", uses: 22, improved: 2, learned: "3 weeks ago", auto: true, desc: "Summarizes your shipped work from git + calendar into the format your team uses.", tools: ["web", "file"], confidence: 0.95 },
  { id: "kitchen-inv", name: "Kitchen Inventory → Recipes", category: "Home", uses: 6, improved: 1, learned: "5 days ago", auto: true, desc: "Takes a photo of your fridge, suggests recipes that use what's about to expire first.", tools: ["web"], confidence: 0.72 },
  { id: "paper-notes", name: "Paper Notes", category: "Research", uses: 18, improved: 4, learned: "2 months ago", auto: true, desc: "Pulls out methodology, results, and your margin-style reactions.", tools: ["web", "file"], confidence: 0.9 },
  { id: "invoice-chase", name: "Invoice Chaser", category: "Work", uses: 9, improved: 1, learned: "6 weeks ago", auto: false, desc: "You wrote this one. Polite, escalating sequence for late invoices.", tools: ["file"], confidence: 0.8 },
  { id: "morning-brief", name: "Morning Brief", category: "Personal", uses: 87, improved: 5, learned: "3 months ago", auto: true, desc: "Weather, top 3 calendar items, the two stocks you watch, overnight emails that matter.", tools: ["web"], confidence: 0.97 },
  { id: "rent-receipts", name: "Receipt Parser", category: "Finance", uses: 34, improved: 2, learned: "2 months ago", auto: true, desc: "OCR receipt photos, categorize, append to your ledger.", tools: ["file"], confidence: 0.93 },
];

const MEMORIES: Memory[] = [
  { id: "m1", kind: "user", text: "Prefers terse, markdown-free responses. No emoji unless I ask.", confidence: 0.98, added: "2 months ago" },
  { id: "m2", kind: "user", text: "Lives in Lisbon. Timezone is Europe/Lisbon. Works hybrid Tue–Thu.", confidence: 1.0, added: "3 months ago" },
  { id: "m3", kind: "project", text: "Kestrel codebase uses pnpm, Vitest, and conventional commits. Deploys Thursdays.", confidence: 0.95, added: "5 weeks ago" },
  { id: "m4", kind: "user", text: "Sister's birthday is Nov 14. Usually sends a handwritten note.", confidence: 0.9, added: "last year" },
  { id: "m5", kind: "project", text: "Reading group meets every other Sunday at 5pm. Skips December.", confidence: 0.88, added: "4 months ago" },
  { id: "m6", kind: "user", text: "Coffee: single origin, pour-over, no oat milk.", confidence: 0.82, added: "6 weeks ago" },
  { id: "m7", kind: "project", text: "Newsletter ships Tuesdays 7am UTC. Buttondown, section order fixed.", confidence: 0.94, added: "2 months ago" },
];

const SCHEDULES: Schedule[] = [
  { id: "s1", name: "Morning brief", cron: "Every weekday at 7:00", next: "Tomorrow, 7:00", last: "Today, 7:00", status: "on", skill: "morning-brief", destination: "Telegram" },
  { id: "s2", name: "Friday newsletter draft", cron: "Fridays at 16:00", next: "Fri, 16:00", last: "Last Fri, 16:00", status: "on", skill: "weekly-report", destination: "Email" },
  { id: "s3", name: "Watch GitHub releases for pnpm", cron: "Every 4 hours", next: "In 2h 14m", last: "4 hours ago", status: "on", skill: null, destination: "Push" },
  { id: "s4", name: "Rent reminder (due day -3)", cron: "Monthly, 27th at 9:00", next: "Apr 27, 9:00", last: "Mar 27, 9:00", status: "paused", skill: null, destination: "Push" },
  { id: "s5", name: "Reading group prep", cron: "Alternate Sundays 14:00", next: "Sun, 14:00", last: "2 weeks ago", status: "on", skill: "paper-notes", destination: "Push" },
];

const SUBAGENTS: Subagent[] = [
  { id: "sa1", title: "Research: competitors for Kestrel", status: "running", progress: 0.62, started: "12 min ago", tokens: 14200, steps: 23, spawned: "from Chat" },
  { id: "sa2", title: "Rewrite onboarding copy (3 variants)", status: "running", progress: 0.34, started: "4 min ago", tokens: 6100, steps: 11, spawned: "from Skills" },
  { id: "sa3", title: "Scrape Ludwig Beethoven biographies", status: "done", progress: 1, started: "this morning", tokens: 22500, steps: 41, spawned: "from Chat" },
  { id: "sa4", title: "Draft quarterly OKR doc", status: "paused", progress: 0.48, started: "yesterday", tokens: 9800, steps: 18, spawned: "from Schedules" },
];

const CHAT_SEED: ChatMessage[] = [
  { id: "c1", role: "hermes", text: "Morning. You asked me yesterday to pull the Lisbon flat listings under €1400. Six new ones since. Want them grouped by neighborhood or ranked?", ts: "9:02" },
  { id: "c2", role: "user", text: "rank them. budget is firm.", ts: "9:03" },
  { id: "c3", role: "hermes", kind: "tool", tool: "web.search", args: "lisbon rentals <1400 eur 2026-04", result: "6 results · 4 kept after dedup", duration: "1.8s" },
  { id: "c4", role: "hermes", kind: "tool", tool: "skill.load", args: "apartment-scorer", result: "your scorer (light, balcony, <30m commute)", duration: "0.2s" },
  { id: "c5", role: "hermes", text: "Ranked. The top three are in Graça, Anjos, and Alvalade. The Graça one is €50 over but has the balcony and a dishwasher, which you flagged as worth the stretch last time. Shall I email the agents?", ts: "9:03" },
];

// ---------- App Store ----------

interface AppState {
  onboarded: boolean;
  accentHue: number;
  density: 'compact' | 'comfortable';
  userName: string;
  setOnboarded: (v: boolean) => void;
  setAccentHue: (v: number) => void;
  setDensity: (v: 'compact' | 'comfortable') => void;
  setUserName: (v: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  onboarded: false,
  accentHue: 55,
  density: 'comfortable',
  userName: 'Maya',
  setOnboarded: (v) => set({ onboarded: v }),
  setAccentHue: (v) => set({ accentHue: v }),
  setDensity: (v) => set({ density: v }),
  setUserName: (v) => set({ userName: v }),
}));

// ---------- Chat Store ----------

interface ChatState {
  messages: ChatMessage[];
  input: string;
  busy: boolean;
  pending: PendingMessage | null;
  contextPct: number;
  setInput: (v: string) => void;
  sendMessage: () => Promise<void>;
}

function nowShort() {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: CHAT_SEED,
  input: '',
  busy: false,
  pending: null,
  contextPct: 0.22,

  setInput: (v) => set({ input: v }),

  sendMessage: async () => {
    const { input, busy, messages } = get();
    const text = input.trim();
    if (!text || busy) return;

    const userMsg: ChatMessage = { id: 'u' + Date.now(), role: 'user', text, ts: nowShort() };
    set({ messages: [...messages, userMsg], input: '', busy: true });

    const scripts = [
      {
        match: /email|send|yes|go|ok|sure|ranked|agents|do it/i,
        steps: [
          { type: 'thought' as const, text: 'Drafting three outreach emails. Using the tone from your last agent-outreach skill.' },
          { type: 'tool' as const, tool: 'skill.load', args: 'agent-outreach-v3', result: 'loaded · polite, concise, EN-PT blend', duration: '0.2s' },
          { type: 'tool' as const, tool: 'subagent.spawn', args: 'draft 3 agent emails in parallel', result: 'subagent sa5 started', duration: '0.4s', opensSubagent: true },
          { type: 'text' as const, text: 'Sent three drafts to your inbox. I kept them under 80 words each and left the asking-price question open so you can negotiate. I\'ll watch replies and nudge after 48 hours if we hear nothing.' },
        ],
      },
      {
        match: /.*/,
        steps: [
          { type: 'thought' as const, text: 'Checking memory, then searching.' },
          { type: 'tool' as const, tool: 'memory.search', args: 'relevant entries', result: '3 matches in USER.md', duration: '0.1s' },
          { type: 'tool' as const, tool: 'web.search', args: 'latest context', result: '2 sources kept', duration: '1.4s' },
          { type: 'text' as const, text: 'Here\'s what I found. I\'ll save the approach as a skill if it works — let me know after you try it.' },
        ],
      },
    ];

    const script = scripts.find((s) => s.match.test(text)) || scripts[scripts.length - 1];

    set({ pending: { kind: 'typing', text: '' } });
    await sleep(700);

    for (const step of script.steps) {
      if (step.type === 'thought') {
        set({ pending: { kind: 'thought', text: step.text } });
        await sleep(1100);
      } else if (step.type === 'tool') {
        set({ pending: null });
        const toolMsg: ChatMessage = {
          id: 't' + Date.now() + Math.random(),
          role: 'hermes',
          kind: 'tool',
          tool: step.tool,
          args: step.args,
          result: step.result,
          duration: step.duration,
          opensSubagent: step.opensSubagent,
        };
        set({ messages: [...get().messages, toolMsg] });
        await sleep(900);
      } else if (step.type === 'text') {
        set({ pending: { kind: 'stream', text: '' } });
        const words = step.text.split(' ');
        let acc = '';
        for (const w of words) {
          acc += (acc ? ' ' : '') + w;
          set({ pending: { kind: 'stream', text: acc } });
          await sleep(35 + Math.random() * 55);
        }
        set({ pending: null });
        set({
          messages: [...get().messages, { id: 'h' + Date.now(), role: 'hermes', text: step.text, ts: nowShort() }],
        });
      }
    }

    set({ contextPct: Math.min(0.95, get().contextPct + 0.08), busy: false });
  },
}));

// ---------- Skills Store ----------

interface SkillsState {
  skills: Skill[];
  query: string;
  filter: 'all' | 'auto' | 'mine';
  setQuery: (v: string) => void;
  setFilter: (v: 'all' | 'auto' | 'mine') => void;
}

export const useSkillsStore = create<SkillsState>((set) => ({
  skills: SKILLS,
  query: '',
  filter: 'all',
  setQuery: (v) => set({ query: v }),
  setFilter: (v) => set({ filter: v }),
}));

// ---------- Memory Store ----------

interface MemoryState {
  memories: Memory[];
  filter: 'all' | 'user' | 'project';
  setFilter: (v: 'all' | 'user' | 'project') => void;
  remove: (id: string) => void;
  update: (id: string, text: string) => void;
  add: (text: string, kind: 'user' | 'project') => void;
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  memories: MEMORIES,
  filter: 'all',
  setFilter: (v) => set({ filter: v }),
  remove: (id) => set({ memories: get().memories.filter((m) => m.id !== id) }),
  update: (id, text) =>
    set({ memories: get().memories.map((m) => (m.id === id ? { ...m, text } : m)) }),
  add: (text, kind) =>
    set({
      memories: [
        { id: 'new' + Date.now(), kind, text, confidence: 0.9, added: 'just now' },
        ...get().memories,
      ],
    }),
}));

// ---------- Schedules Store ----------

interface SchedulesState {
  schedules: Schedule[];
  toggle: (id: string) => void;
  add: (name: string, cron: string) => void;
}

export const useSchedulesStore = create<SchedulesState>((set, get) => ({
  schedules: SCHEDULES,
  toggle: (id) =>
    set({
      schedules: get().schedules.map((s) =>
        s.id === id ? { ...s, status: s.status === 'on' ? 'paused' : 'on' } : s
      ),
    }),
  add: (name, cron) =>
    set({
      schedules: [
        {
          id: 'new' + Date.now(),
          name,
          cron,
          next: 'Soon',
          last: '—',
          status: 'on',
          skill: null,
          destination: 'Push',
        },
        ...get().schedules,
      ],
    }),
}));

// ---------- Subagents Store ----------

interface SubagentsState {
  subagents: Subagent[];
  tick: number;
  incrementTick: () => void;
}

export const useSubagentsStore = create<SubagentsState>((set, get) => ({
  subagents: SUBAGENTS,
  tick: 0,
  incrementTick: () => {
    set({
      tick: get().tick + 1,
      subagents: get().subagents.map((s) =>
        s.status === 'running' ? { ...s, progress: Math.min(1, s.progress + 0.005) } : s
      ),
    });
  },
}));
