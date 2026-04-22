import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '@/stores/appStore';
import { HermesColors } from '@/constants/theme';
import {
  IconBack,
  IconCheck,
  IconChev,
  IconHermesMark,
} from '@/components/ui/Icon';
import Animated, {
  FadeIn,
  FadeInRight,
} from 'react-native-reanimated';

const STEPS = ['welcome', 'provider', 'platforms', 'memory'];

const PROVIDERS = [
  { id: 'nous', name: 'Nous Portal', meta: 'OAuth · recommended', tag: 'Fast' },
  { id: 'openrouter', name: 'OpenRouter', meta: '200+ models, pay per token', tag: 'Flexible' },
  { id: 'local', name: 'Local (Ollama)', meta: 'Runs on your machine', tag: 'Private' },
  { id: 'custom', name: 'Custom endpoint', meta: 'Paste any OpenAI-compatible URL', tag: null },
];

const PLATFORMS = ['Telegram', 'Discord', 'Slack', 'WhatsApp', 'Signal', 'Email', 'SMS', 'iMessage'];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [provider, setProvider] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<Set<string>>(new Set(['Telegram']));
  const [name, setName] = useState('');
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const setUserName = useAppStore((s) => s.setUserName);

  const next = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setUserName(name || 'you');
      setOnboarded(true);
      router.replace('/(tabs)');
    }
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  const togglePlatform = (p: string) => {
    const s = new Set(platforms);
    if (s.has(p)) s.delete(p);
    else s.add(p);
    setPlatforms(s);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={back} style={[styles.backBtn, { opacity: step ? 1 : 0 }]}>
          <IconBack size={22} color={HermesColors.text} />
        </TouchableOpacity>
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity onPress={() => { setOnboarded(true); router.replace('/(tabs)'); }}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {step === 0 && (
          <Animated.View entering={FadeIn} style={styles.step}>
            <View style={{ alignItems: 'center' }}>
              <IconHermesMark size={56} color={HermesColors.accent} />
            </View>
            <Text style={styles.heroTitle}>Hi. I'm your agent.</Text>
            <Text style={styles.heroSerif}>The longer we work together, the better I get.</Text>
            <Text style={styles.obSub}>
              I write my own skills from what we do, remember what matters, and meet you on
              whichever app you actually use.
            </Text>
            <View style={styles.nameSection}>
              <Text style={styles.nameLabel}>What should I call you?</Text>
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                placeholder="Your first name"
                placeholderTextColor={HermesColors.textMute}
                autoFocus
              />
            </View>
          </Animated.View>
        )}

        {step === 1 && (
          <Animated.View entering={FadeInRight} style={styles.step}>
            <Text style={styles.stepKicker}>Step 02 · Model</Text>
            <Text style={styles.stepTitle}>Where should I think?</Text>
            <Text style={styles.obSub}>
              I run on any OpenAI-compatible endpoint. You keep your keys.
            </Text>
            <View style={styles.providerList}>
              {PROVIDERS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.provider, provider === p.id && styles.providerSel]}
                  onPress={() => setProvider(p.id)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.providerName}>{p.name}</Text>
                    <Text style={styles.providerMeta}>{p.meta}</Text>
                  </View>
                  {p.tag && (
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>{p.tag}</Text>
                    </View>
                  )}
                  {provider === p.id && (
                    <IconCheck size={18} color={HermesColors.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View entering={FadeInRight} style={styles.step}>
            <Text style={styles.stepKicker}>Step 03 · Reach</Text>
            <Text style={styles.stepTitle}>Where should I find you?</Text>
            <Text style={styles.obSub}>
              Pick any. Start one, continue on another — same agent, same memory.
            </Text>
            <View style={styles.platformsGrid}>
              {PLATFORMS.map((p) => {
                const on = platforms.has(p);
                return (
                  <TouchableOpacity
                    key={p}
                    style={[styles.platform, on && styles.platformOn]}
                    onPress={() => togglePlatform(p)}>
                    <View style={[styles.platDot, on && styles.platDotOn]} />
                    <Text style={[styles.platText, on && styles.platTextOn]}>{p}</Text>
                    {on && <IconCheck size={16} color={HermesColors.accent} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        )}

        {step === 3 && (
          <Animated.View entering={FadeInRight} style={styles.step}>
            <Text style={styles.stepKicker}>Step 04 · Memory</Text>
            <Text style={styles.stepTitle}>One last thing.</Text>
            <Text style={styles.obSub}>
              I keep a small, readable file of what I learn about you. You can open it any time and
              edit with a pencil. Nothing goes anywhere you didn't send it.
            </Text>
            <View style={styles.memPreview}>
              <View style={styles.memPreHead}>
                <Text style={styles.memPreTitle}>USER.md · 1 entry</Text>
              </View>
              <View style={styles.memPreBody}>
                <Text style={styles.memRow}>
                  <Text style={styles.memDash}>— </Text>
                  Prefers to be called {name || 'you'}.
                </Text>
                <Text style={[styles.memRow, styles.memRowGhost]}>
                  <Text style={styles.memDash}>— </Text> I'll add more as we go.
                </Text>
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnPrimary} onPress={next}>
          <Text style={styles.btnPrimaryText}>
            {step === 3 ? 'Start' : 'Continue'}
          </Text>
          <IconChev size={18} color={HermesColors.bg} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HermesColors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    height: 50,
  },
  backBtn: {
    padding: 6,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 18,
    height: 4,
    borderRadius: 2,
    backgroundColor: HermesColors.line,
  },
  dotActive: {
    backgroundColor: HermesColors.accent,
  },
  skip: {
    color: HermesColors.textMute,
    fontSize: 13,
    padding: 6,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  step: {
    flex: 1,
  },
  heroTitle: {
    fontFamily: 'Georgia',
    fontWeight: '400',
    fontSize: 42,
    lineHeight: 48,
    color: HermesColors.text,
    marginTop: 24,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  heroSerif: {
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    fontSize: 22,
    color: HermesColors.accent,
    marginBottom: 22,
    lineHeight: 30,
  },
  obSub: {
    color: HermesColors.textDim,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 300,
  },
  nameSection: {
    marginTop: 44,
  },
  nameLabel: {
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: HermesColors.textMute,
    marginBottom: 10,
  },
  nameInput: {
    fontSize: 22,
    color: HermesColors.text,
    borderBottomWidth: 1,
    borderBottomColor: HermesColors.line,
    paddingVertical: 12,
    fontFamily: 'Georgia',
  },
  stepKicker: {
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: HermesColors.accent,
    marginBottom: 14,
  },
  stepTitle: {
    fontFamily: 'Georgia',
    fontSize: 36,
    lineHeight: 38,
    color: HermesColors.text,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  providerList: {
    marginTop: 24,
    gap: 10,
  },
  provider: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: HermesColors.surface,
    borderWidth: 1,
    borderColor: HermesColors.lineSoft,
    borderRadius: 18,
    gap: 10,
  },
  providerSel: {
    borderColor: HermesColors.accent,
    backgroundColor: HermesColors.surface2,
  },
  providerName: {
    fontWeight: '500',
    fontSize: 15,
    color: HermesColors.text,
  },
  providerMeta: {
    color: HermesColors.textMute,
    fontSize: 12.5,
    marginTop: 3,
  },
  chip: {
    backgroundColor: HermesColors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: HermesColors.accent,
  },
  platformsGrid: {
    marginTop: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  platform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    backgroundColor: HermesColors.surface,
    borderWidth: 1,
    borderColor: HermesColors.lineSoft,
    borderRadius: 14,
    width: '47%',
  },
  platformOn: {
    borderColor: HermesColors.accent,
    backgroundColor: HermesColors.accentSoft,
  },
  platDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: HermesColors.textMute,
  },
  platDotOn: {
    backgroundColor: HermesColors.accent,
  },
  platText: {
    fontSize: 14,
    fontWeight: '500',
    color: HermesColors.text,
    flex: 1,
  },
  platTextOn: {
    color: HermesColors.accent,
  },
  memPreview: {
    marginTop: 24,
    backgroundColor: HermesColors.bg2,
    borderWidth: 1,
    borderColor: HermesColors.lineSoft,
    borderRadius: 16,
    overflow: 'hidden',
  },
  memPreHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: HermesColors.lineSoft,
    backgroundColor: HermesColors.surface,
  },
  memPreTitle: {
    fontSize: 12.5,
    color: HermesColors.textMute,
  },
  memPreBody: {
    padding: 14,
  },
  memRow: {
    fontSize: 13,
    color: HermesColors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  memRowGhost: {
    color: HermesColors.textMute,
  },
  memDash: {
    color: HermesColors.accent,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  btnPrimary: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: HermesColors.accent,
    borderRadius: 16,
  },
  btnPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: HermesColors.bg,
  },
});
