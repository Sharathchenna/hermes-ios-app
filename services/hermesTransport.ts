import { HttpChatTransport, UIMessage, UIMessageChunk } from 'ai';
import { fetch as expoFetch } from 'expo/fetch';
import { getEffectiveToken, getEffectiveUrl } from './apiConfig';

/**
 * Custom AI SDK transport for the Hermes backend.
 *
 * The Hermes backend speaks standard OpenAI SSE over /v1/chat/completions.
 * It does NOT expose client-side tool_calls (tools run inside the agent loop).
 * It supports stateful sessions via X-Hermes-Session-Id.
 */
export class HermesTransport extends HttpChatTransport<UIMessage> {
  constructor() {
    super({
      // Placeholder — overridden by prepareSendMessagesRequest below
      api: 'https://hermes.sharathchenna.top',
      fetch: expoFetch as unknown as typeof globalThis.fetch,

      prepareSendMessagesRequest: async ({ id, messages, headers }) => {
        const baseUrl = await getEffectiveUrl();
        const token = await getEffectiveToken();

        // Convert AI SDK UIMessages → Hermes / OpenAI format
        const hermesMessages = messages.map((m) => {
          const text = m.parts
            .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
            .map((p) => p.text)
            .join('');
          return { role: m.role, content: text };
        });

        return {
          api: `${baseUrl}/v1/chat/completions`,
          headers: {
            ...(headers as Record<string, string>),
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Hermes-Session-Id': id,
          },
          body: {
            model: 'hermes-ios',
            messages: hermesMessages,
            stream: true,
          },
        };
      },

      // Hermes does not support stream resumption
      prepareReconnectToStreamRequest: undefined,
    });
  }

  /**
   * Parse standard OpenAI SSE into AI SDK UIMessageChunks.
   *
   Expected SSE lines:
     data: {"id":"chatcmpl-...","object":"chat.completion.chunk",...}
     data: [DONE]
     : keepalive                ← ignored
   */
  protected processResponseStream(
    stream: ReadableStream<Uint8Array<ArrayBufferLike>>
  ): ReadableStream<UIMessageChunk> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let messageId = '';
    let started = false;

    return new ReadableStream({
      async pull(controller) {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            if (started && messageId) {
              controller.enqueue({ type: 'text-end', id: messageId });
              controller.enqueue({ type: 'finish', finishReason: 'stop' });
            }
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(':')) continue; // keepalive / empty
            if (!trimmed.startsWith('data: ')) continue;

            const payload = trimmed.slice(6);

            if (payload === '[DONE]') {
              if (started && messageId) {
                controller.enqueue({ type: 'text-end', id: messageId });
                controller.enqueue({ type: 'finish', finishReason: 'stop' });
              }
              controller.close();
              return;
            }

            try {
              const chunk = JSON.parse(payload);
              const id = chunk.id || messageId;
              if (id) messageId = id;

              const delta = chunk.choices?.[0]?.delta;
              const finishReason = chunk.choices?.[0]?.finish_reason;

              if (delta?.content) {
                if (!started) {
                  started = true;
                  controller.enqueue({ type: 'start', messageId });
                  controller.enqueue({ type: 'text-start', id: messageId });
                }
                controller.enqueue({
                  type: 'text-delta',
                  delta: delta.content,
                  id: messageId,
                });
              }

              if (finishReason && started && messageId) {
                controller.enqueue({ type: 'text-end', id: messageId });
                controller.enqueue({
                  type: 'finish',
                  finishReason: finishReason === 'stop' ? 'stop' : 'other',
                });
              }
            } catch {
              // malformed JSON — skip
            }
          }
        }
      },

      cancel() {
        reader.releaseLock();
      },
    });
  }
}
