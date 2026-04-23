import {
  ChatCompletionResponse,
  ChatMessage,
  Job,
  JobCreateRequest,
  JobsResponse,
  JobUpdateRequest,
  MemoryResponse,
  MemoryUpdateRequest,
  parseSSELine,
  RunDetail,
  RunsResponse,
  SkillDetail,
  SkillSummary
} from '@/types/api';
import { getEffectiveToken, getEffectiveUrl, isConfigured } from './apiConfig';

async function getHeaders(): Promise<Record<string, string>> {
  const token = await getEffectiveToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function getBaseUrl(): Promise<string> {
  const url = await getEffectiveUrl();
  return url.replace(/\/$/, '');
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const configured = await isConfigured();
  if (!configured) {
    throw new Error('Not configured. Please set the server URL and token in Settings.');
  }

  const baseUrl = await getBaseUrl();
  const headers = await getHeaders();
  const url = `${baseUrl}${path}`;
  console.log('[apiFetch]', options?.method || 'GET', url);
  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options?.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('[apiFetch] error:', res.status, text, 'URL:', url);
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ---------- Health / Connection Test ----------

export async function healthCheck(): Promise<{ status: string; platform: string }> {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/health`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Tests that auth works by calling an endpoint that requires it
export async function testAuth(): Promise<void> {
  const configured = await isConfigured();
  if (!configured) {
    throw new Error('Not configured. Please set the server URL and token in Settings.');
  }
  // Try to list models (lightweight auth-required endpoint)
  await apiFetch('/v1/models');
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
  const configured = await isConfigured();
  if (!configured) {
    throw new Error('Not configured. Please set the server URL and token in Settings.');
  }

  const baseUrl = await getBaseUrl();
  const headers = await getHeaders();
  let res: Response;
  try {
    res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ model: 'hermes-ios', messages, stream: true }),
    });
  } catch (err) {
    throw new Error(`Network error: ${err instanceof Error ? err.message : 'Unable to reach server'}`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Server error ${res.status}: ${text}`);
  }

  // Fallback for React Native or servers that don't support streaming
  if (!res.body || typeof res.body.getReader !== 'function') {
    const text = await res.text().catch(() => '');
    if (!text) {
      throw new Error('Server returned an empty response. Check that streaming is enabled on the server.');
    }

    // Try parsing as SSE (server may have sent all events in one chunk)
    const lines = text.split('\n');
    let fullContent = '';
    for (const line of lines) {
      const parsed = parseSSELine(line);
      if (parsed === '[DONE]') break;
      if (parsed && parsed.choices?.[0]?.delta?.content) {
        fullContent += parsed.choices[0].delta.content;
      }
    }
    if (fullContent) {
      yield fullContent;
      return;
    }

    // Try parsing as regular JSON (non-streaming fallback)
    try {
      const json = JSON.parse(text) as ChatCompletionResponse;
      if (json.choices?.[0]?.message?.content) {
        yield json.choices[0].message.content;
        return;
      }
    } catch { /* not valid JSON */ }

    throw new Error('Server returned an unexpected response format. Check that streaming is enabled on the server.');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const parsed = parseSSELine(line);
        if (parsed === '[DONE]') return;
        if (parsed && parsed.choices?.[0]?.delta?.content) {
          yield parsed.choices[0].delta.content;
        }
      }
    }
  } finally {
    reader.releaseLock();
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
