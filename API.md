# Hermes Agent HTTP API Reference

Base URL: `https://hermes.sharathchenna.top` (production) or `http://localhost:8642` (local)

Auth: Bearer token in every request except `/health`.

---

## 1. Health Check

`GET /health`

No auth required.

**Response**
```json
{
  "status": "ok",
  "platform": "hermes-agent"
}
```

---

## 2. OpenAI-Compatible Chat

These endpoints power the actual chat. Use them in `chat.tsx` to replace the mock `sendMessage` flow.

### 2.1 List Models

`GET /v1/models`

**Headers**
```
Authorization: Bearer <token>
```

**Response**
```json
{
  "object": "list",
  "data": [
    {
      "id": "hermes-ios",
      "object": "model",
      "created": 1715000000,
      "owned_by": "hermes-agent"
    }
  ]
}
```

### 2.2 Chat Completions (with SSE streaming)

`POST /v1/chat/completions`

**Headers**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**
```json
{
  "model": "hermes-ios",
  "messages": [
    { "role": "system", "content": "You are Hermes, a helpful assistant." },
    { "role": "user", "content": "Hello" }
  ],
  "stream": true
}
```

**Response (Server-Sent Events)**

Content-Type: `text/event-stream`

Each line is prefixed with `data: `. The stream ends with `data: [DONE]`.

```
data: {"id":"chatcmpl-abc","object":"chat.completion.chunk","created":1715000000,"model":"hermes-ios","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc","object":"chat.completion.chunk","created":1715000000,"model":"hermes-ios","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc","object":"chat.completion.chunk","created":1715000000,"model":"hermes-ios","choices":[{"index":0,"delta":{"content":"!"},"finish_reason":null}]}

data: [DONE]
```

**Important field for streaming**
- `choices[0].delta.content` — the next token string (may be `null` on the first chunk)
- `choices[0].finish_reason` — `"stop"` when the response ends

**Non-streaming response**

If `stream: false`:
```json
{
  "id": "chatcmpl-abc",
  "object": "chat.completion",
  "created": 1715000000,
  "model": "hermes-ios",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 9,
    "total_tokens": 21
  }
}
```

---

## 3. Management API

Use these to populate Skills, Memory, and Subagents tabs with real data.

### 3.1 List Skills

`GET /api/skills`

**Headers**
```
Authorization: Bearer <token>
```

**Response**
```json
[
  {
    "name": "trip-planner",
    "description": "Three-pass planner: draft, critique timings, balance against budget.",
    "category": "travel"
  },
  {
    "name": "pr-review",
    "description": "Reads diff, flags missing tests, notes style inconsistencies.",
    "category": "engineering"
  }
]
```

> The server currently returns an array of lightweight objects. `name`, `description`, and `category` are always present.

### 3.2 Skill Detail

`GET /api/skills/{name}`

URL-encode the skill name. Hyphens and dots are common.

**Response**
```json
{
  "name": "trip-planner",
  "category": "travel",
  "description": "Three-pass planner...",
  "content": "# Trip Planner Skill\n\n1. Draft itinerary...",
  "linked_files": ["references/travel-checklist.md"],
  "usage": "Load this skill when the user asks for travel plans."
}
```

### 3.3 Read Memory

`GET /api/memory`

**Response**
```json
{
  "memory": {
    "entries": [
      "Prefers terse, markdown-free responses.",
      "Lives in Lisbon. Timezone is Europe/Lisbon."
    ],
    "charCount": 87,
    "limit": 2200,
    "pct": "3%"
  },
  "user": {
    "entries": [
      "Prefers terse, markdown-free responses.",
      "Lives in Lisbon. Timezone is Europe/Lisbon."
    ],
    "charCount": 87,
    "limit": 2200,
    "pct": "3%"
  }
}
```

> **Note**: The server returns plain text strings in `entries`, not structured objects. If your UI expects `Memory` objects with `id`, `kind`, `confidence`, etc., synthesize those fields client-side (e.g., hash the string into an `id`).

### 3.4 Update Memory

`POST /api/memory`

**Request Body**
```json
{
  "target": "user",
  "action": "add",
  "content": "Likes pour-over coffee, no oat milk."
}
```

**Actions**
- `add` — append a new entry
- `replace` — overwrite an existing entry (requires `old_text`)
- `remove` — delete an entry (requires `old_text`)

**Replace / Remove Example**
```json
{
  "target": "user",
  "action": "replace",
  "content": "Likes single-origin pour-over.",
  "old_text": "Likes pour-over coffee, no oat milk."
}
```

> **Critical**: The server matches entries by the **original text content**, not by an ID. To update or delete, you must cache the original text string.

### 3.5 List Runs (Subagents)

`GET /api/runs`

**Response**
```json
{
  "runs": [
    {
      "runId": "run_abc123",
      "createdAt": "2026-04-22T14:32:00Z",
      "ageSeconds": 120
    }
  ],
  "count": 1,
  "background_tasks": 0
}
```

> The server returns lightweight metadata. If your UI expects `Subagent` objects with `title`, `status`, `progress`, `tokens`, etc., synthesize them:
> - `title` → `"Run " + runId.slice(0,8)`
> - `status` → `ageSeconds < 300 ? "running" : "done"`
> - `progress` → `running ? min(ageSeconds / 300, 0.95) : 1.0`

### 3.6 Run Detail

`GET /api/runs/{run_id}`

**Response** (shape varies; often includes events if available)
```json
{
  "runId": "run_abc123",
  "createdAt": "2026-04-22T14:32:00Z",
  "events": [
    { "type": "step", "text": "Searching web..." }
  ]
}
```

### 3.7 List Cron Jobs (Schedules)

`GET /api/jobs`

**Query params**
- `include_disabled=true` — also return paused / disabled jobs

**Headers**
```
Authorization: Bearer <token>
```

**Response**
```json
{
  "jobs": [
    {
      "id": "7ff988d1bc02",
      "name": "morning-brief",
      "prompt": "Generate a morning briefing",
      "skills": [],
      "skill": null,
      "model": null,
      "provider": null,
      "base_url": null,
      "script": null,
      "schedule": {
        "kind": "cron",
        "expr": "0 9 * * *",
        "display": "0 9 * * *"
      },
      "schedule_display": "0 9 * * *",
      "repeat": { "times": null, "completed": 0 },
      "enabled": true,
      "state": "scheduled",
      "paused_at": null,
      "paused_reason": null,
      "created_at": "2026-04-22T19:48:08.981013+00:00",
      "next_run_at": "2026-04-23T09:00:00+00:00",
      "last_run_at": null,
      "last_status": null,
      "last_error": null,
      "last_delivery_error": null,
      "deliver": "local",
      "origin": null
    }
  ]
}
```

> **Mapping to app types**: The `Schedule` type in the app expects `id`, `name`, `cron`, `next`, `last`, `status: 'on'|'paused'`, `skill`, `destination`. Bridge from server:
> - `id` → `job.id`
> - `name` → `job.name`
> - `cron` → `job.schedule.display`
> - `next` → a human-readable string from `job.next_run_at` (e.g., `new Date(job.next_run_at).toLocaleString()`)
> - `last` → a human-readable string from `job.last_run_at` or `"—"`
> - `status` → `job.enabled ? 'on' : 'paused'`
> - `skill` → `job.skill || (job.skills.length ? job.skills[0] : null)`
> - `destination` → `job.deliver`

### 3.8 Create Job

`POST /api/jobs`

**Headers**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**
```json
{
  "name": "morning-brief",
  "schedule": "0 9 * * *",
  "prompt": "Generate a morning briefing with weather and calendar",
  "deliver": "local",
  "skills": ["morning-brief"],
  "repeat": null
}
```

**Fields**
- `name` (required, max 120 chars) — friendly name
- `schedule` (required) — cron expression, human-readable string (e.g., `"every 2h"`), or ISO timestamp
- `prompt` (optional, max 2000 chars) — the prompt sent to the agent when the job fires
- `deliver` (optional, default `"local"`) — where to send the result: `"local"`, `"telegram"`, `"discord"`, etc.
- `skills` (optional) — array of skill names to load before running
- `repeat` (optional) — positive integer for one-shot repeat count

**Response** — returns the created job object (same shape as `GET /api/jobs/{job_id}`)

### 3.9 Get Job

`GET /api/jobs/{job_id}`

**Response**
```json
{
  "job": { /* same shape as list item */ }
}
```

### 3.10 Update Job

`PATCH /api/jobs/{job_id}`

**Request Body** — any subset of the fields below:
```json
{
  "name": "updated-name",
  "schedule": "0 8 * * *",
  "prompt": "Updated prompt",
  "deliver": "telegram",
  "skills": ["morning-brief"],
  "repeat": 5,
  "enabled": false
}
```

**Response** — returns the updated job object.

### 3.11 Delete Job

`DELETE /api/jobs/{job_id}`

**Response**
```json
{ "ok": true }
```

### 3.12 Pause / Resume / Run Now

`POST /api/jobs/{job_id}/pause`
`POST /api/jobs/{job_id}/resume`
`POST /api/jobs/{job_id}/run`

**Response** — returns the updated job object.

---

## 4. TypeScript Types for the App

Add these to a new file (e.g., `types/api.ts`) so the rest of the app can import them.

```typescript
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

```

---

## 5. React Native / Expo Fetch Examples

### 5.1 Send a chat message (non-streaming)

```typescript
const API_URL = 'https://hermes.sharathchenna.top'; // or http://localhost:8642
const TOKEN = 'ios-app-secret-key-change-this-in-production';

async function chat(messages: ChatMessage[]): Promise<string> {
  const res = await fetch(`${API_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'hermes-ios',
      messages,
      stream: false,
    }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: ChatCompletionResponse = await res.json();
  return json.choices[0].message.content;
}
```

### 5.2 Stream a chat message (SSE)

```typescript
async function* streamChat(messages: ChatMessage[]): AsyncGenerator<string, void> {
  const res = await fetch(`${API_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'hermes-ios',
      messages,
      stream: true,
    }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const parsed = parseSSELine(line);
      if (parsed === '[DONE]') return;
      if (parsed && parsed.choices[0].delta.content) {
        yield parsed.choices[0].delta.content;
      }
    }
  }
}
```

### 5.3 Fetch skills

```typescript
async function fetchSkills(): Promise<SkillSummary[]> {
  const res = await fetch(`${API_URL}/api/skills`, {
    headers: { 'Authorization': `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

### 5.4 Fetch memory

```typescript
async function fetchMemory(): Promise<MemoryResponse> {
  const res = await fetch(`${API_URL}/api/memory`, {
    headers: { 'Authorization': `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

### 5.5 Update memory

```typescript
async function addMemory(text: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/memory`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      target: 'user',
      action: 'add',
      content: text,
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
```

### 5.6 Fetch runs (subagents)

```typescript
async function fetchRuns(): Promise<RunsResponse> {
  const res = await fetch(`${API_URL}/api/runs`, {
    headers: { 'Authorization': `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

### 5.7 Fetch jobs (schedules)

```typescript
async function fetchJobs(includeDisabled = false): Promise<JobsResponse> {
  const qs = includeDisabled ? '?include_disabled=true' : '';
  const res = await fetch(`${API_URL}/api/jobs${qs}`, {
    headers: { 'Authorization': `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

### 5.8 Create / update / delete a job

```typescript
async function createJob(req: JobCreateRequest): Promise<{ job: Job }> {
  const res = await fetch(`${API_URL}/api/jobs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function updateJob(jobId: string, req: JobUpdateRequest): Promise<{ job: Job }> {
  const res = await fetch(`${API_URL}/api/jobs/${encodeURIComponent(jobId)}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function deleteJob(jobId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/jobs/${encodeURIComponent(jobId)}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

async function toggleJob(jobId: string, enabled: boolean): Promise<{ job: Job }> {
  const action = enabled ? 'resume' : 'pause';
  const res = await fetch(`${API_URL}/api/jobs/${encodeURIComponent(jobId)}/${action}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function runJobNow(jobId: string): Promise<{ job: Job }> {
  const res = await fetch(`${API_URL}/api/jobs/${encodeURIComponent(jobId)}/run`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

---

## 6. Wiring into the App

The current app uses **mock data** in `stores/appStore.ts`. To connect to the real server:

1. **Create `services/hermesApi.ts`** — add the fetch wrappers from section 5.
2. **Update `stores/appStore.ts`** — replace mock arrays with async fetch calls:
   - `useSkillsStore` → call `fetchSkills()` on mount
   - `useMemoryStore` → call `fetchMemory()` on mount; bridge `entries: string[]` into `Memory[]` objects
   - `useSubagentsStore` → call `fetchRuns()` on mount; bridge `RunSummary[]` into `Subagent[]` objects
   - `useSchedulesStore` → call `fetchJobs()` on mount; bridge `Job[]` into `Schedule[]` objects
   - `useChatStore.sendMessage` → use `streamChat()` instead of the hardcoded script
3. **Add instance settings in `settings.tsx`** — let the user input:
   - Server URL (default `https://hermes.sharathchenna.top`)
   - Auth token
4. **Persist settings** — use `expo-secure-store` or `AsyncStorage` to save URL + token.

---

## 7. Important Notes

| Gotcha | Fix |
|--------|-----|
| Server uses **SSE**, not WebSockets | Use `fetch` + `response.body.getReader()` in RN |
| Memory entries are plain **strings**, not objects | Hash the string to generate an `id` client-side |
| Memory updates match by **original text**, not ID | Cache the original text to enable edit/delete |
| Runs have no `title`, `status`, or `progress` | Infer from `runId` and `ageSeconds` |
| Skill names may contain hyphens | Always URL-encode path segments |
| Chat is **stateless** | Send the full conversation history every time |
| Schedules have **no HTTP endpoint** | They are managed via the Hermes CLI (`hermes cronjob`) |
