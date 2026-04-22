import {
  ChatMessage,
  ChatCompletionResponse,
  ChatCompletionStreamResponse,
  parseSSELine,
  SkillSummary,
  SkillDetail,
  MemoryResponse,
  MemoryUpdateRequest,
  RunsResponse,
  RunDetail,
  JobsResponse,
  JobCreateRequest,
  JobUpdateRequest,
  Job,
} from '@/types/api';
import { getApiUrl, getApiToken } from './apiConfig';

async function getHeaders(): Promise<Record<string, string>> {
  const token = await getApiToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function getBaseUrl(): Promise<string> {
  return getApiUrl();
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const baseUrl = await getBaseUrl();
  const headers = await getHeaders();
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { ...headers, ...(options?.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ---------- Health ----------

export async function healthCheck(): Promise<{ status: string; platform: string }> {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/health`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ---------- Chat ----------

export async function chat(messages: ChatMessage[]): Promise<string> {
  const json = await apiFetch<ChatCompletionResponse>('/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify({ model: 'hermes-ios', messages, stream: false }),
  });
  return json.choices[0].message.content;
}

export async function* streamChat(messages: ChatMessage[]): AsyncGenerator<string, void> {
  const baseUrl = await getBaseUrl();
  const headers = await getHeaders();
  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model: 'hermes-ios', messages, stream: true }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

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
      if (parsed && parsed.choices[0]?.delta?.content) {
        yield parsed.choices[0].delta.content;
      }
    }
  }
}

// ---------- Skills ----------

export async function fetchSkills(): Promise<SkillSummary[]> {
  return apiFetch<SkillSummary[]>('/api/skills');
}

export async function fetchSkillDetail(name: string): Promise<SkillDetail> {
  return apiFetch<SkillDetail>(`/api/skills/${encodeURIComponent(name)}`);
}

// ---------- Memory ----------

export async function fetchMemory(): Promise<MemoryResponse> {
  return apiFetch<MemoryResponse>('/api/memory');
}

export async function updateMemory(req: MemoryUpdateRequest): Promise<void> {
  await apiFetch('/api/memory', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// ---------- Runs (Subagents) ----------

export async function fetchRuns(): Promise<RunsResponse> {
  return apiFetch<RunsResponse>('/api/runs');
}

export async function fetchRunDetail(runId: string): Promise<RunDetail> {
  return apiFetch<RunDetail>(`/api/runs/${encodeURIComponent(runId)}`);
}

// ---------- Jobs (Schedules) ----------

export async function fetchJobs(includeDisabled = false): Promise<JobsResponse> {
  const qs = includeDisabled ? '?include_disabled=true' : '';
  return apiFetch<JobsResponse>(`/api/jobs${qs}`);
}

export async function createJob(req: JobCreateRequest): Promise<{ job: Job }> {
  return apiFetch<{ job: Job }>('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function updateJob(jobId: string, req: JobUpdateRequest): Promise<{ job: Job }> {
  return apiFetch<{ job: Job }>(`/api/jobs/${encodeURIComponent(jobId)}`, {
    method: 'PATCH',
    body: JSON.stringify(req),
  });
}

export async function deleteJob(jobId: string): Promise<void> {
  await apiFetch(`/api/jobs/${encodeURIComponent(jobId)}`, {
    method: 'DELETE',
  });
}

export async function toggleJob(jobId: string, enabled: boolean): Promise<{ job: Job }> {
  const action = enabled ? 'resume' : 'pause';
  return apiFetch<{ job: Job }>(`/api/jobs/${encodeURIComponent(jobId)}/${action}`, {
    method: 'POST',
  });
}

export async function runJobNow(jobId: string): Promise<{ job: Job }> {
  return apiFetch<{ job: Job }>(`/api/jobs/${encodeURIComponent(jobId)}/run`, {
    method: 'POST',
  });
}
