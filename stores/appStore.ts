import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchSkills,
  fetchMemory,
  updateMemory,
  fetchRuns,
  fetchJobs,
  createJob,
  toggleJob,
  streamChat,
  healthCheck,
} from '@/services/hermesApi';
import {
  setApiUrl,
  setApiToken,
  getApiUrl,
  getApiToken,
} from '@/services/apiConfig';
import type { SkillSummary, Job, RunSummary } from '@/types/api';

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

// ---------- Helpers ----------

function nowShort() {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function hashId(text: string): string {
  return 'h' + text.split('').reduce((a, b) => a + b.charCodeAt(0), 0).toString(36);
}

function bridgeSkill(s: SkillSummary): Skill {
  return {
    id: s.name,
    name: s.name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    category: s.category,
    uses: 0,
    improved: 1,
    learned: 'recently',
    auto: true,
    desc: s.description,
    tools: [],
    confidence: 0.9,
  };
}

function bridgeJob(j: Job): Schedule {
  return {
    id: j.id,
    name: j.name,
    cron: j.schedule_display || j.schedule?.display || j.schedule?.expr || 'Unknown',
    next: j.next_run_at ? new Date(j.next_run_at).toLocaleString() : '—',
    last: j.last_run_at ? new Date(j.last_run_at).toLocaleString() : '—',
    status: j.enabled ? 'on' : 'paused',
    skill: j.skill || (j.skills?.length ? j.skills[0] : null),
    destination: j.deliver || 'local',
  };
}

function bridgeRun(r: RunSummary): Subagent {
  const age = r.ageSeconds || 0;
  const running = age < 300;
  return {
    id: r.runId,
    title: 'Run ' + r.runId.slice(0, 8),
    status: running ? 'running' : 'done',
    progress: running ? Math.min(age / 300, 0.95) : 1,
    started: age < 60 ? `${age}s ago` : age < 3600 ? `${Math.floor(age / 60)}m ago` : `${Math.floor(age / 3600)}h ago`,
    tokens: Math.floor(Math.random() * 20000 + 5000),
    steps: Math.floor(Math.random() * 40 + 5),
    spawned: 'from Chat',
  };
}

// ---------- Chat History Persistence ----------

const CHAT_HISTORY_KEY = '@hermes_chat_history';

async function saveChatHistory(messages: ChatMessage[]) {
  try {
    await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  } catch { /* ignore */ }
}

async function loadChatHistory(): Promise<ChatMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

// ---------- App Store ----------

interface AppState {
  onboarded: boolean;
  accentHue: number;
  density: 'compact' | 'comfortable';
  userName: string;
  apiUrl: string;
  apiToken: string;
  online: boolean;
  setOnboarded: (v: boolean) => void;
  setAccentHue: (v: number) => void;
  setDensity: (v: 'compact' | 'comfortable') => void;
  setUserName: (v: string) => void;
  setApiUrl: (v: string) => Promise<void>;
  setApiToken: (v: string) => Promise<void>;
  checkOnline: () => Promise<void>;
  loadConfig: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  onboarded: false,
  accentHue: 55,
  density: 'comfortable',
  userName: 'Maya',
  apiUrl: 'https://hermes.sharathchenna.top',
  apiToken: 'ios-app-secret-key-change-this-in-production',
  online: false,

  setOnboarded: (v) => set({ onboarded: v }),
  setAccentHue: (v) => set({ accentHue: v }),
  setDensity: (v) => set({ density: v }),
  setUserName: (v) => set({ userName: v }),

  setApiUrl: async (v) => {
    await setApiUrl(v);
    set({ apiUrl: v });
  },

  setApiToken: async (v) => {
    await setApiToken(v);
    set({ apiToken: v });
  },

  checkOnline: async () => {
    try {
      await healthCheck();
      set({ online: true });
    } catch {
      set({ online: false });
    }
  },

  loadConfig: async () => {
    const [url, token] = await Promise.all([getApiUrl(), getApiToken()]);
    set({ apiUrl: url, apiToken: token });
    // Try to check online
    try {
      await healthCheck();
      set({ online: true });
    } catch {
      set({ online: false });
    }
  },
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
  loadHistory: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  input: '',
  busy: false,
  pending: null,
  contextPct: 0.22,

  setInput: (v) => set({ input: v }),

  loadHistory: async () => {
    const history = await loadChatHistory();
    set({ messages: history });
  },

  sendMessage: async () => {
    const { input, busy, messages } = get();
    const text = input.trim();
    if (!text || busy) return;

      const userMsg: ChatMessage = { id: 'u' + Date.now(), role: 'user' as const, text, ts: nowShort() };
      const newMessages = [...messages, userMsg];
      set({ messages: newMessages, input: '', busy: true });
      await saveChatHistory(newMessages);

    try {
      const apiMessages = newMessages
        .filter((m) => m.role === 'user' || (m.role === 'hermes' && m.text))
        .map((m) => ({ role: (m.role === 'hermes' ? 'assistant' : 'user') as 'assistant' | 'user', content: m.text || '' }));

      set({ pending: { kind: 'stream', text: '' } });

      let fullText = '';
      const stream = streamChat(apiMessages);
      for await (const token of stream) {
        fullText += token;
        set({ pending: { kind: 'stream', text: fullText } });
      }

      set({ pending: null });
      const hermesMsg: ChatMessage = { id: 'h' + Date.now(), role: 'hermes' as const, text: fullText, ts: nowShort() };
      const finalMessages: ChatMessage[] = [...get().messages, hermesMsg];
      set({ messages: finalMessages, busy: false });
      await saveChatHistory(finalMessages);
    } catch (err) {
      set({ pending: null });
      const errorMsg: ChatMessage = {
        id: 'err' + Date.now(),
        role: 'hermes' as const,
        text: err instanceof Error ? err.message : 'Something went wrong.',
        ts: nowShort(),
      };
      const finalMessages: ChatMessage[] = [...get().messages, errorMsg];
      set({ messages: finalMessages, busy: false });
      await saveChatHistory(finalMessages);
    }
  },
}));

// ---------- Skills Store ----------

interface SkillsState {
  skills: Skill[];
  query: string;
  filter: 'all' | 'auto' | 'mine';
  loading: boolean;
  error: string | null;
  setQuery: (v: string) => void;
  setFilter: (v: 'all' | 'auto' | 'mine') => void;
  load: () => Promise<void>;
}

export const useSkillsStore = create<SkillsState>((set) => ({
  skills: [],
  query: '',
  filter: 'all',
  loading: false,
  error: null,

  setQuery: (v) => set({ query: v }),
  setFilter: (v) => set({ filter: v }),

  load: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchSkills();
      set({ skills: data.map(bridgeSkill), loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load skills', loading: false });
    }
  },
}));

// ---------- Memory Store ----------

interface MemoryState {
  memories: Memory[];
  filter: 'all' | 'user' | 'project';
  loading: boolean;
  error: string | null;
  setFilter: (v: 'all' | 'user' | 'project') => void;
  load: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  update: (id: string, text: string) => Promise<void>;
  add: (text: string, kind: 'user' | 'project') => Promise<void>;
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  memories: [],
  filter: 'all',
  loading: false,
  error: null,

  setFilter: (v) => set({ filter: v }),

  load: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchMemory();
      const userEntries = (data.user?.entries || []).map((text) => ({
        id: hashId(text),
        kind: 'user' as 'user',
        text,
        confidence: 0.9,
        added: 'from server',
      }));
      const memEntries = (data.memory?.entries || []).map((text) => ({
        id: hashId(text),
        kind: 'project' as 'project',
        text,
        confidence: 0.85,
        added: 'from server',
      }));
      set({ memories: [...userEntries, ...memEntries], loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load memory', loading: false });
    }
  },

  remove: async (id) => {
    const m = get().memories.find((x) => x.id === id);
    if (!m) return;
    try {
      await updateMemory({ target: m.kind === 'project' ? 'memory' : 'user', action: 'remove', old_text: m.text });
      set({ memories: get().memories.filter((x) => x.id !== id) });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to remove' });
    }
  },

  update: async (id, text) => {
    const m = get().memories.find((x) => x.id === id);
    if (!m) return;
    try {
      await updateMemory({ target: m.kind === 'project' ? 'memory' : 'user', action: 'replace', content: text, old_text: m.text });
      set({ memories: get().memories.map((x) => (x.id === id ? { ...x, text } : x)) });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update' });
    }
  },

  add: async (text, kind) => {
    try {
      await updateMemory({ target: kind === 'project' ? 'memory' : 'user', action: 'add', content: text });
      set({
        memories: [
          { id: hashId(text), kind, text, confidence: 0.9, added: 'just now' },
          ...get().memories,
        ],
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add' });
    }
  },
}));

// ---------- Schedules Store ----------

interface SchedulesState {
  schedules: Schedule[];
  loading: boolean;
  error: string | null;
  toggle: (id: string) => Promise<void>;
  add: (name: string, cron: string) => Promise<void>;
  load: () => Promise<void>;
}

export const useSchedulesStore = create<SchedulesState>((set, get) => ({
  schedules: [],
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchJobs(true);
      set({ schedules: (data.jobs || []).map(bridgeJob), loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load schedules', loading: false });
    }
  },

  toggle: async (id) => {
    const s = get().schedules.find((x) => x.id === id);
    if (!s) return;
    try {
      await toggleJob(id, s.status === 'paused');
      set({
        schedules: get().schedules.map((x) =>
          x.id === id ? { ...x, status: x.status === 'on' ? 'paused' : 'on' } : x
        ),
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to toggle' });
    }
  },

  add: async (name, cron) => {
    try {
      const res = await createJob({ name, schedule: cron });
      set({ schedules: [bridgeJob(res.job), ...get().schedules] });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to create schedule' });
    }
  },
}));

// ---------- Subagents Store ----------

interface SubagentsState {
  subagents: Subagent[];
  tick: number;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
}

export const useSubagentsStore = create<SubagentsState>((set, get) => ({
  subagents: [],
  tick: 0,
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchRuns();
      set({ subagents: (data.runs || []).map(bridgeRun), loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load runs', loading: false });
    }
  },
}));
