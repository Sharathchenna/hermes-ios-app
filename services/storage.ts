import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Conversation, ChatConfig } from '../types';

const KEYS = {
  conversations: '@hermes/conversations',
  config: '@hermes/config',
  activeId: '@hermes/activeId',
};

export const Storage = {
  // --- Conversations ---
  async loadConversations(): Promise<Conversation[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.conversations);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async saveConversations(conversations: Conversation[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        KEYS.conversations,
        JSON.stringify(conversations)
      );
    } catch (e) {
      console.error('Failed to save conversations:', e);
    }
  },

  // --- Config ---
  async loadConfig(): Promise<ChatConfig | null> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.config);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async saveConfig(config: ChatConfig): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.config, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save config:', e);
    }
  },

  // --- Active Conversation ID ---
  async loadActiveId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.activeId);
    } catch {
      return null;
    }
  },

  async saveActiveId(id: string | null): Promise<void> {
    try {
      if (id) {
        await AsyncStorage.setItem(KEYS.activeId, id);
      } else {
        await AsyncStorage.removeItem(KEYS.activeId);
      }
    } catch (e) {
      console.error('Failed to save active ID:', e);
    }
  },
};
