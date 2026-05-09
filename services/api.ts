import type { Message, ChatConfig, StreamChunk } from '../types';

const BASE_URL = 'https://hermes.sharathchenna.top';

export class HermesAPI {
  private config: ChatConfig;

  constructor(config: ChatConfig) {
    this.config = config;
  }

  updateConfig(config: ChatConfig) {
    this.config = config;
  }

  private get baseUrl(): string {
    return (this.config.baseUrl || BASE_URL).replace(/\/+$/, '');
  }

  private get headers(): Record<string, string> {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.config.apiKey) {
      h['Authorization'] = `Bearer ${this.config.apiKey}`;
    }
    return h;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async streamChat(
    messages: Message[],
    onChunk: (chunk: StreamChunk) => void,
    onDone: () => void,
    onError: (error: Error) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const apiMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const body = JSON.stringify({
      model: this.config.model || 'hermes',
      messages: apiMessages,
      stream: true,
    });

    try {
      const response = await fetch(
        `${this.baseUrl}/v1/chat/completions`,
        {
          method: 'POST',
          headers: this.headers,
          body,
          signal,
        }
      );

      if (!response.ok) {
        const errText = await response.text().catch(() => 'Unknown error');
        onError(new Error(`HTTP ${response.status}: ${errText}`));
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        onError(new Error('No response body'));
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            onDone();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const choice = parsed.choices?.[0];
            if (choice?.delta?.content) {
              onChunk({
                id: parsed.id || '',
                content: choice.delta.content,
                finishReason: choice.finish_reason || null,
              });
            }
            if (choice?.finish_reason === 'stop') {
              // Will also get [DONE] but handle just in case
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }

      onDone();
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          onDone();
          return;
        }
        onError(err);
      } else {
        onError(new Error(String(err)));
      }
    }
  }
}
