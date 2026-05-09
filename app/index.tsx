import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import ChatMessage from '../components/ChatMessage';
import Composer from '../components/Composer';
import TypingIndicator from '../components/TypingIndicator';
import Sidebar from '../components/Sidebar';

import { useChatStore } from '../stores/chatStore';
import { HermesAPI } from '../services/api';
import { Storage } from '../services/storage';
import { Colors } from '../constants/theme';
import type { Message, ChatConfig } from '../types';

let apiInstance: HermesAPI | null = null;
function getAPI(config: ChatConfig): HermesAPI {
  if (!apiInstance) {
    apiInstance = new HermesAPI(config);
  } else {
    apiInstance.updateConfig(config);
  }
  return apiInstance;
}

export default function ChatScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const abortRef = useRef<AbortController | null>(null);

  const {
    conversations,
    activeConversationId,
    status,
    error,
    streamingContent,
    config,
    setStatus,
    setError,
    appendStreamContent,
    clearStream,
    commitStream,
    setConversations,
    setActiveConversation,
    addConversation,
    addMessage,
    updateConversation,
    deleteConversation,
  } = useChatStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // --- Initialize from storage ---
  useEffect(() => {
    (async () => {
      const [savedConvs, savedConfig, savedActiveId] = await Promise.all([
        Storage.loadConversations(),
        Storage.loadConfig(),
        Storage.loadActiveId(),
      ]);

      if (savedConfig) {
        useChatStore.getState().setConfig(savedConfig);
      }
      if (savedConvs.length > 0) {
        setConversations(savedConvs);
        if (savedActiveId && savedConvs.some((c) => c.id === savedActiveId)) {
          setActiveConversation(savedActiveId);
        } else {
          setActiveConversation(savedConvs[0].id);
        }
      }
      setIsInitialized(true);
    })();
  }, []);

  // --- Persist conversations on change ---
  useEffect(() => {
    if (isInitialized && conversations.length > 0) {
      Storage.saveConversations(conversations);
    }
  }, [conversations, isInitialized]);

  // --- Persist active ID ---
  useEffect(() => {
    if (isInitialized) {
      Storage.saveActiveId(activeConversationId);
    }
  }, [activeConversationId, isInitialized]);

  // --- Health check on mount ---
  useEffect(() => {
    const check = async () => {
      const api = getAPI(useChatStore.getState().config);
      const ok = await api.healthCheck();
      setIsConnected(ok);
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- Auto-scroll ---
  useEffect(() => {
    if (streamingContent || status === 'streaming') {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [streamingContent, status]);

  // --- Ensure active conversation exists ---
  useEffect(() => {
    if (isInitialized && !activeConversationId) {
      handleNewChat();
    }
  }, [isInitialized, activeConversationId]);

  const activeMessages = useChatStore.getState().activeMessages();

  const handleNewChat = useCallback(() => {
    const newConv = {
      id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: 'New conversation',
      messages: [],
      model: config.model || 'hermes',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addConversation(newConv);
  }, [config.model, addConversation]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!activeConversationId) return;

      const userMsg: Message = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: text,
        createdAt: Date.now(),
      };

      addMessage(activeConversationId, userMsg);

      // Auto-name conversation after first message
      const currentConv = useChatStore
        .getState()
        .conversations.find((c) => c.id === activeConversationId);
      if (currentConv && currentConv.messages.length === 1) {
        const title = text.length > 60 ? text.slice(0, 60) + '…' : text;
        updateConversation(activeConversationId, { title });
      }

      // Build message history
      const updatedConv = useChatStore
        .getState()
        .conversations.find((c) => c.id === activeConversationId);
      const history = updatedConv?.messages ?? [];

      // Start streaming
      setStatus('streaming');
      setError(null);
      clearStream();

      abortRef.current = new AbortController();

      const api = getAPI(useChatStore.getState().config);
      await api.streamChat(
        [...history, userMsg],
        (chunk) => {
          appendStreamContent(chunk.content);
        },
        () => {
          commitStream();
          setStatus('idle');
        },
        (err) => {
          setError(err.message);
          setStatus('error');
        },
        abortRef.current.signal
      );
    },
    [
      activeConversationId,
      config,
      addMessage,
      updateConversation,
      setStatus,
      setError,
      clearStream,
      appendStreamContent,
      commitStream,
    ]
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    commitStream();
    setStatus('idle');
  }, [commitStream, setStatus]);

  const isBusy = status === 'streaming' || status === 'loading';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => setSidebarOpen(true)}
        >
          <View style={styles.hamburger}>
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </View>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerTitle}>
            <Text style={styles.titleText}>Hermes</Text>
            <Text style={styles.titleSubtext}>Research</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.push('/settings')}
        >
          <View style={styles.dotsIcon}>
            <View style={styles.dotsDot} />
            <View style={styles.dotsDot} />
            <View style={styles.dotsDot} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Messages area */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome / empty state */}
          {activeMessages.length === 0 && !isBusy && (
            <View style={styles.welcome}>
              <View style={styles.welcomeIcon}>
                <Text style={styles.welcomeIconText}>H</Text>
              </View>
              <Text style={styles.welcomeTitle}>How can I help you?</Text>
              <Text style={styles.welcomeSubtitle}>
                Ask me anything — research, write, analyze, code
              </Text>
              {/* Connection status */}
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isConnected
                        ? Colors.accent
                        : Colors.danger,
                    },
                  ]}
                />
                <Text style={styles.statusText}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Text>
              </View>

              {/* Suggestion chips */}
              <View style={styles.suggestions}>
                {suggestions.map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.chip}
                    onPress={() => handleSend(s)}
                  >
                    <Text style={styles.chipText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Message list */}
          {activeMessages.map((msg, i) => {
            const isLastAssistant =
              i === activeMessages.length - 1 &&
              msg.role === 'assistant' &&
              streamingContent.length > 0;
            return (
              <ChatMessage
                key={msg.id}
                message={
                  isLastAssistant
                    ? { ...msg, content: streamingContent || msg.content }
                    : msg
                }
                isStreaming={isLastAssistant && status === 'streaming'}
              />
            );
          })}

          {/* Typing indicator */}
          {status === 'streaming' &&
            (activeMessages.length === 0 ||
              activeMessages[activeMessages.length - 1]?.role !== 'assistant') &&
            streamingContent.length === 0 && <TypingIndicator />}

          {/* Error banner */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                onPress={() => setError(null)}
                style={styles.errorDismiss}
              >
                <Text style={styles.errorDismissText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom padding */}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Composer */}
        <View style={styles.composerContainer}>
          {isBusy && (
            <TouchableOpacity style={styles.stopBtn} onPress={handleStop}>
              <View style={styles.stopIcon}>
                <View style={styles.stopSquare} />
              </View>
              <Text style={styles.stopText}>Stop generating</Text>
            </TouchableOpacity>
          )}
          <Composer
            onSend={handleSend}
            disabled={isBusy}
            placeholder={
              isBusy ? 'Hermes is responding…' : 'Ask Hermes anything'
            }
          />
        </View>
      </KeyboardAvoidingView>

      {/* Sidebar */}
      <Sidebar
        visible={sidebarOpen}
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={(id) => setActiveConversation(id)}
        onNewChat={handleNewChat}
        onDelete={(id) => deleteConversation(id)}
        onClose={() => setSidebarOpen(false)}
      />
    </SafeAreaView>
  );
}

const suggestions = [
  'Help me research a topic',
  'Write a Python script',
  'Summarize the latest AI news',
  'Debug my code',
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerBtn: {
    padding: 8,
    borderRadius: 8,
  },
  hamburger: {
    width: 20,
    height: 16,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    height: 2,
    backgroundColor: Colors.text,
    borderRadius: 1,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  titleSubtext: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '500',
  },
  dotsIcon: {
    flexDirection: 'row',
    gap: 3,
  },
  dotsDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.text,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  welcome: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  welcomeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeIconText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  composerContainer: {
    backgroundColor: Colors.bg,
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  stopIcon: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopSquare: {
    width: 12,
    height: 12,
    backgroundColor: Colors.danger,
    borderRadius: 2,
  },
  stopText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: Colors.danger,
    lineHeight: 18,
  },
  errorDismiss: {
    padding: 4,
    marginLeft: 8,
  },
  errorDismissText: {
    color: Colors.danger,
    fontSize: 14,
  },
});
