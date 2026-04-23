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
  testAuth,
} from '@/services/hermesApi';
import {
  setApiUrl as saveApiUrl,
  setApiToken as saveApiToken,
  getApiUrl,
  getApiToken,
} from '@/services/apiConfig';
import type { SkillSummary, Job, RunSummary } from '@/types/api';
import type { UIMessage } from 'ai';

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

export type HermesMessage = UIMessage;

// ---------- Helpers ----------

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

// ---------- Chat History Persistence (AI SDK format) ----------

const CHAT_HISTORY_KEY = '@hermes_chat_history_v2';
const CHAT_SESSION_KEY = '@hermes_chat_session';

export async function saveChatHistory(messages: UIMessage[]) {
  try {
    await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  } catch { /* ignore */ }
}

export async function loadChatHistory(): Promise<UIMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

export async function getOrCreateChatId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(CHAT_SESSION_KEY);
    if (existing) return existing;
  } catch { /* ignore */ }
  const id = 'chat-' + Date.now();
  try {
    await AsyncStorage.setItem(CHAT_SESSION_KEY, id);
  } catch { /* ignore */ }
  return id;
}

export async function resetChatSession(): Promise<string> {
  const id = 'chat-' + Date.now();
  try {
    await AsyncStorage.setItem(CHAT_SESSION_KEY, id);
    await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
  } catch { /* ignore */ }
  return id;
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
  chatId: string;
  setOnboarded: (v: boolean) => void;
  setAccentHue: (v: number) => void;
  setDensity: (v: 'compact' | 'comfortable') => void;
  setUserName: (v: string) => void;
  setApiUrl: (v: string) => Promise<void>;
  setApiToken: (v: string) => Promise<void>;
  checkOnline: () => Promise<void>;
  loadConfig: () => Promise<void>;
  resetChat: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  onboarded: false,
  accentHue: 55,
  density: 'comfortable',
  userName: 'Maya',
  apiUrl: 'https://hermes.sharathchenna.top',
  apiToken: 'ios-app-secret-key-change-this-in-production',
  online: false,
  chatId: '',

  setOnboarded: (v) => set({ onboarded: v }),
  setAccentHue: (v) => set({ accentHue: v }),
  setDensity: (v) => set({ density: v }),
  setUserName: (v) => set({ userName: v }),

  setApiUrl: async (v) => {
    await saveApiUrl(v);
    set({ apiUrl: v, online: false });
  },

  setApiToken: async (v) => {
    await saveApiToken(v);
    set({ apiToken: v, online: false });
  },

  checkOnline: async () => {
    try {
      // testAuth validates both URL and token by calling an auth-required endpoint
      await testAuth();
      set({ online: true });
    } catch {
      set({ online: false });
    }
  },

  loadConfig: async () => {
    const [url, token, chatId] = await Promise.all([
      getApiUrl(),
      getApiToken(),
      getOrCreateChatId(),
    ]);
    set({ apiUrl: url, apiToken: token, chatId });
    // Only check online if both are configured
    if (url.trim() && token.trim()) {
      try {
        await testAuth();
        set({ online: true });
      } catch {
        set({ online: false });
      }
    } else {
      set({ online: false });
    }
  },

  resetChat: async () => {
    const chatId = await resetChatSession();
    set({ chatId });
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
