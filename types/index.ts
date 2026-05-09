export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChatConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface StreamChunk {
  id: string;
  content: string;
  finishReason: string | null;
}

export type ChatStatus = 'idle' | 'loading' | 'streaming' | 'error';
