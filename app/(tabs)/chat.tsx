import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChatStore, ChatMessage, useAppStore } from '@/stores/appStore';
import { HermesColors } from '@/constants/theme';
import {
  IconHermesMark,
  IconDots,
  IconPlus,
  IconSend,
  IconPause,
  IconBolt,
  IconWeb,
  IconTerminal,
} from '@/components/ui/Icon';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from 'react-native-reanimated';
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

function MessageBubble({ m }: { m: ChatMessage }) {
  if (m.kind === 'tool') {
    return (
      <View style={styles.toolCard}>
        <View style={styles.toolHead}>
          <IconBolt size={13} color={HermesColors.accent} />
          <Text style={styles.toolName}>{m.tool}</Text>
          <Text style={styles.toolDur}>{m.duration}</Text>
        </View>
        <Text style={styles.toolArgs}>→ {m.args}</Text>
        <Text style={styles.toolResult}>✓ {m.result}</Text>
      </View>
    );
  }

  const isUser = m.role === 'user';
  return (
    <View>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleHermes]}>
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextHermes]}>
          {m.text}
        </Text>
      </View>
      {m.ts && (
        <Text style={[styles.bubbleTs, isUser ? styles.bubbleTsRight : styles.bubbleTsLeft]}>
          {m.ts}
        </Text>
      )}
    </View>
  );
}

export default function ChatScreen() {
  const { messages, input, busy, pending, contextPct, setInput, sendMessage, loadHistory } = useChatStore();
  const online = useAppStore((s) => s.online);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, pending]);

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
          <ContextRing pct={contextPct} />
          <TouchableOpacity style={styles.iconBtn}>
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
          <MessageBubble key={m.id} m={m} />
        ))}

        {pending?.kind === 'typing' && (
          <View style={[styles.bubble, styles.bubbleHermes]}>
            <TypingDots />
          </View>
        )}

        {pending?.kind === 'thought' && (
          <View style={styles.thought}>
            <View style={styles.thoughtDot} />
            <Text style={styles.thoughtText}>{pending.text}</Text>
          </View>
        )}

        {pending?.kind === 'stream' && (
          <View style={[styles.bubble, styles.bubbleHermes]}>
            <Text style={styles.bubbleTextHermes}>
              {pending.text}
              <Text style={styles.caret}>|</Text>
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Composer */}
      <View style={styles.composer}>
        <View style={styles.compBar}>
          <TouchableOpacity style={styles.compIcon}>
            <IconPlus size={20} color={HermesColors.textDim} />
          </TouchableOpacity>
          <TextInput
            style={styles.compInput}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            placeholder={busy ? 'Hermes is working…' : 'Message Hermes'}
            placeholderTextColor={HermesColors.textMute}
            editable={!busy}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.compSend, (!input.trim() || busy) && styles.compSendDisabled]}
            onPress={sendMessage}
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
  bubbleTs: {
    fontSize: 10,
    color: HermesColors.textMute,
    marginTop: 2,
    marginHorizontal: 4,
  },
  bubbleTsRight: {
    textAlign: 'right',
  },
  bubbleTsLeft: {
    textAlign: 'left',
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
  thought: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  thoughtDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: HermesColors.accent,
    marginTop: 8,
  },
  thoughtText: {
    color: HermesColors.textMute,
    fontSize: 12.5,
    fontStyle: 'italic',
    fontFamily: 'Georgia',
    lineHeight: 18,
    flex: 1,
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
  toolHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolName: {
    fontWeight: '500',
    color: HermesColors.accent,
    fontSize: 12,
  },
  toolDur: {
    color: HermesColors.textMute,
    fontSize: 10,
    marginLeft: 'auto',
  },
  toolArgs: {
    color: HermesColors.textDim,
    fontSize: 12,
    paddingLeft: 20,
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
