import { create } from 'zustand';
import type { Conversation, Message, ChatStatus, ChatConfig } from '../types';

interface ChatState {
  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  status: ChatStatus;
  error: string | null;

  // Streaming buffer
  streamingContent: string;

  // Config
  config: ChatConfig;

  // Actions
  setConfig: (config: Partial<ChatConfig>) => void;
  setStatus: (status: ChatStatus) => void;
  setError: (error: string | null) => void;
  appendStreamContent: (chunk: string) => void;
  commitStream: () => void;
  clearStream: () => void;

  // Conversation management
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;

  // Derived
  activeConversation: () => Conversation | undefined;
  activeMessages: () => Message[];
}

const DEFAULT_CONFIG: ChatConfig = {
  baseUrl: 'https://hermes.sharathchenna.top',
  apiKey: '',
  model: 'hermes',
};

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  status: 'idle',
  error: null,
  streamingContent: '',
  config: DEFAULT_CONFIG,

  setConfig: (partial) =>
    set((state) => ({ config: { ...state.config, ...partial } })),

  setStatus: (status) => set({ status }),

  setError: (error) => set({ error }),

  appendStreamContent: (chunk) =>
    set((state) => ({ streamingContent: state.streamingContent + chunk })),

  clearStream: () => set({ streamingContent: '' }),

  commitStream: () => {
    const state = get();
    if (!state.streamingContent || !state.activeConversationId) return;

    const messages = state.activeMessages();
    const lastMsg = messages[messages.length - 1];

    if (lastMsg && lastMsg.role === 'assistant') {
      // Update the last assistant message
      const updated: Message = {
        ...lastMsg,
        content: state.streamingContent,
      };
      set((s) => ({
        conversations: s.conversations.map((c) =>
          c.id === s.activeConversationId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === lastMsg.id ? updated : m
                ),
                updatedAt: Date.now(),
              }
            : c
        ),
        streamingContent: '',
      }));
    } else {
      // Add a new assistant message
      const newMsg: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: state.streamingContent,
        createdAt: Date.now(),
      };
      set((s) => ({
        conversations: s.conversations.map((c) =>
          c.id === s.activeConversationId
            ? {
                ...c,
                messages: [...c.messages, newMsg],
                updatedAt: Date.now(),
              }
            : c
        ),
        streamingContent: '',
      }));
    }
  },

  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (id) => set({ activeConversationId: id }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      activeConversationId: conversation.id,
    })),

  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  deleteConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      activeConversationId:
        state.activeConversationId === id ? null : state.activeConversationId,
    })),

  addMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [...c.messages, message],
              updatedAt: Date.now(),
            }
          : c
      ),
    })),

  updateMessage: (conversationId, messageId, content) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId ? { ...m, content } : m
              ),
              updatedAt: Date.now(),
            }
          : c
      ),
    })),

  activeConversation: () => {
    const state = get();
    return state.conversations.find(
      (c) => c.id === state.activeConversationId
    );
  },

  activeMessages: () => {
    const conv = get().activeConversation();
    return conv?.messages ?? [];
  },
}));
