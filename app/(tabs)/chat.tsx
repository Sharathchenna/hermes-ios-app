import {
  IconBolt,
  IconDots,
  IconHermesMark,
  IconPause,
  IconPlus,
  IconSend,
  IconTerminal,
  IconWeb,
} from '@/components/ui/Icon';
import { HermesColors } from '@/constants/theme';
import { HermesTransport } from '@/services/hermesTransport';
import { loadChatHistory, saveChatHistory, useAppStore } from '@/stores/appStore';
import { useChat, type UIMessage } from '@ai-sdk/react';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function ContextRing({ pct }: { pct: number }) {
  const r = 11;
  const c = 2 * Math.PI * r;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(pct, { duration: 600 });
  }, [pct]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: c * (1 - progress.value),
  }));

  return (
    <View style={{ width: 28, height: 28 }}>
      <Svg width={28} height={28} viewBox="0 0 28 28">
        <Circle cx="14" cy="14" r={r} fill="none" stroke={HermesColors.line} strokeWidth={2} />
        <AnimatedCircle
          cx="14"
          cy="14"
          r={r}
          fill="none"
          stroke={HermesColors.accent}
          strokeWidth={2}
          strokeDasharray={c}
          strokeLinecap="round"
          transform="rotate(-90 14 14)"
          animatedProps={animatedProps}
        />
      </Svg>
    </View>
  );
}

function TypingDots() {
  return (
    <View style={styles.typing}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.typingDot} />
      ))}
    </View>
  );
}

/** Extract plain text from a UIMessage's text parts */
function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user';
  const text = getMessageText(message);

  // Handle tool invocations if the backend ever exposes them
  const toolParts = message.parts.filter((p) => p.type.startsWith('tool-'));
  if (toolParts.length > 0) {
    return (
      <View style={styles.toolCard}>
        <Text style={styles.toolName}>Tool call</Text>
        <Text style={styles.toolResult}>{JSON.stringify(toolParts, null, 2)}</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleHermes]}>
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextHermes]}>
          {text}
        </Text>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const chatId = useAppStore((s) => s.chatId);
  const online = useAppStore((s) => s.online);
  const resetChat = useAppStore((s) => s.resetChat);
  const scrollRef = useRef<ScrollView>(null);
  const [input, setInput] = useState('');
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | undefined>(undefined);
  const lastHapticLength = useRef(0);

  // Load persisted history on first mount
  useEffect(() => {
    loadChatHistory().then((history) => {
      if (history.length > 0) setInitialMessages(history);
    });
  }, []);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    id: chatId || undefined,
    transport: new HermesTransport(),
    messages: initialMessages,
    onFinish: ({ messages }) => {
      saveChatHistory(messages);
    },
    onError: (err) => {
      console.error('Chat error:', err);
    },
  });

  // Sync loaded history into useChat once it's ready
  useEffect(() => {
    if (initialMessages && messages.length === 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Haptic feedback while streaming
  useEffect(() => {
    if (status === 'streaming' && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      const text = getMessageText(lastMsg);
      if (text.length > lastHapticLength.current) {
        // Trigger light haptic every ~8 characters to avoid over-triggering
        if (text.length - lastHapticLength.current >= 8) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          lastHapticLength.current = text.length;
        }
      }
    } else if (status !== 'streaming') {
      lastHapticLength.current = 0;
    }
  }, [messages, status]);

  const busy = status === 'submitted' || status === 'streaming';
  const isStreaming = status === 'streaming';

  const handleSend = () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    sendMessage({ text });
  };

  const handleReset = () => {
    resetChat();
    setMessages([]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <IconHermesMark size={24} color={HermesColors.accent} />
            <View>
              <Text style={styles.headerTitle}>Hermes</Text>
              <View style={styles.headerSub}>
                <View style={[styles.headerDot, { backgroundColor: online ? HermesColors.good : HermesColors.danger }]} />
                <Text style={styles.headerSubText}>
                  {online ? 'awake · haiku · claude-sonnet fallback' : 'offline · check settings'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            <ContextRing pct={0.22} />
            <TouchableOpacity style={styles.iconBtn} onPress={handleReset}>
              <IconDots size={20} color={HermesColors.textDim} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.daySep}>Today · Lisbon</Text>

          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}

          {status === 'submitted' && (
            <View style={[styles.bubble, styles.bubbleHermes]}>
              <TypingDots />
            </View>
          )}

          {isStreaming && messages.length > 0 && (
            <View style={[styles.bubble, styles.bubbleHermes]}>
              <Text style={styles.bubbleTextHermes}>
                {getMessageText(messages[messages.length - 1])}
                <Text style={styles.caret}>|</Text>
              </Text>
            </View>
          )}

          {error && (
            <View style={[styles.bubble, styles.bubbleHermes, { borderColor: HermesColors.danger }]}>
              <Text style={[styles.bubbleTextHermes, { color: HermesColors.danger }]}>
                {error.message}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Composer */}
        <View style={[styles.composer, { paddingBottom: Math.max(24, insets.bottom + 64) }]}>
          <View style={styles.compBar}>
            <TouchableOpacity style={styles.compIcon}>
              <IconPlus size={20} color={HermesColors.textDim} />
            </TouchableOpacity>
            <TextInput
              style={styles.compInput}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              placeholder={busy ? 'Hermes is working…' : 'Message Hermes'}
              placeholderTextColor={HermesColors.textMute}
              editable={!busy}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.compSend, (!input.trim() || busy) && styles.compSendDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || busy}>
              {busy ? (
                <IconPause size={18} color={HermesColors.bg} />
              ) : (
                <IconSend size={18} color={HermesColors.bg} />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.compMeta}>
            <TouchableOpacity style={styles.compPill}>
              <IconBolt size={12} color={HermesColors.textMute} />
              <Text style={styles.compPillText}>Skills auto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.compPill}>
              <IconWeb size={12} color={HermesColors.textMute} />
              <Text style={styles.compPillText}>Web on</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.compPill}>
              <IconTerminal size={12} color={HermesColors.textMute} />
              <Text style={styles.compPillText}>dusk-vm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HermesColors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: HermesColors.lineSoft,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '500',
    fontSize: 16,
    letterSpacing: -0.2,
    color: HermesColors.text,
  },
  headerSub: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  headerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  headerSubText: {
    color: HermesColors.textMute,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 10,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
  },
  daySep: {
    textAlign: 'center',
    fontSize: 10.5,
    color: HermesColors.textMute,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginVertical: 4,
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 18,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: HermesColors.accent,
    borderBottomRightRadius: 6,
  },
  bubbleHermes: {
    alignSelf: 'flex-start',
    backgroundColor: HermesColors.surface,
    borderWidth: 1,
    borderColor: HermesColors.lineSoft,
    borderBottomLeftRadius: 6,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleTextUser: {
    color: '#1a1208',
  },
  bubbleTextHermes: {
    color: HermesColors.text,
  },
  typing: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 2,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: HermesColors.textMute,
  },
  toolCard: {
    alignSelf: 'flex-start',
    backgroundColor: HermesColors.bg2,
    borderWidth: 1,
    borderColor: HermesColors.lineSoft,
    borderRadius: 14,
    padding: 10,
    paddingHorizontal: 12,
    gap: 4,
    maxWidth: '90%',
  },
  toolName: {
    fontWeight: '500',
    color: HermesColors.accent,
    fontSize: 12,
  },
  toolResult: {
    color: HermesColors.text,
    fontSize: 12,
    paddingLeft: 20,
  },
  caret: {
    color: HermesColors.accent,
    fontWeight: '300',
  },
  composer: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: HermesColors.lineSoft,
    backgroundColor: HermesColors.composerBg,
  },
  compBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: HermesColors.surface,
    borderWidth: 1,
    borderColor: HermesColors.lineSoft,
    borderRadius: 22,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  compIcon: {
    padding: 8,
    borderRadius: 20,
  },
  compInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    color: HermesColors.text,
    fontSize: 15,
  },
  compSend: {
    backgroundColor: HermesColors.accent,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compSendDisabled: {
    opacity: 0.4,
  },
  compMeta: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 10,
    paddingHorizontal: 2,
  },
  compPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: HermesColors.lineSoft,
    borderRadius: 999,
  },
  compPillText: {
    color: HermesColors.textMute,
    fontSize: 10.5,
  },
});
