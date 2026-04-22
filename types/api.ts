// ---------- OpenAI Chat ----------

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  stream: boolean;
}

export interface ChatCompletionStreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: StreamChoice[];
}

export interface StreamChoice {
  index: number;
  delta: {
    role?: string;
    content?: string;
  };
  finish_reason: string | null;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ---------- Server-Sent Events Parser ----------

export function parseSSELine(line: string): ChatCompletionStreamResponse | '[DONE]' | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data: ')) return null;
  const payload = trimmed.slice(6);
  if (payload === '[DONE]') return '[DONE]';
  try {
    return JSON.parse(payload) as ChatCompletionStreamResponse;
  } catch {
    return null;
  }
}

// ---------- Management API ----------

export interface SkillSummary {
  name: string;
  description: string;
  category: string;
}

export interface SkillDetail extends SkillSummary {
  content: string;
  linked_files: string[];
  usage: string;
}

export interface MemorySection {
  entries: string[];
  charCount: number;
  limit: number;
  pct: string;
}

export interface MemoryResponse {
  memory: MemorySection;
  user: MemorySection;
}

export interface MemoryUpdateRequest {
  target: 'memory' | 'user';
  action: 'add' | 'replace' | 'remove';
  content?: string;
  old_text?: string;
}

export interface RunSummary {
  runId: string;
  createdAt: string;
  ageSeconds: number;
}

export interface RunsResponse {
  runs: RunSummary[];
  count: number;
  background_tasks: number;
}

export interface RunDetail {
  runId: string;
  createdAt: string;
  events?: { type: string; text: string }[];
}

// ---------- Jobs (Schedules) ----------

export interface JobSchedule {
  kind: 'cron' | 'one_shot' | 'iso';
  expr: string;
  display: string;
}

export interface JobRepeat {
  times: number | null;
  completed: number;
}

export interface Job {
  id: string;
  name: string;
  prompt: string;
  skills: string[];
  skill: string | null;
  model: string | null;
  provider: string | null;
  base_url: string | null;
  script: string | null;
  schedule: JobSchedule;
  schedule_display: string;
  repeat: JobRepeat;
  enabled: boolean;
  state: string;
  paused_at: string | null;
  paused_reason: string | null;
  created_at: string;
  next_run_at: string | null;
  last_run_at: string | null;
  last_status: string | null;
  last_error: string | null;
  last_delivery_error: string | null;
  deliver: string;
  origin: string | null;
}

export interface JobsResponse {
  jobs: Job[];
}

export interface JobCreateRequest {
  name: string;
  schedule: string;
  prompt?: string;
  deliver?: string;
  skills?: string[];
  repeat?: number | null;
}

export interface JobUpdateRequest {
  name?: string;
  schedule?: string;
  prompt?: string;
  deliver?: string;
  skills?: string[];
  repeat?: number | null;
  enabled?: boolean;
}
