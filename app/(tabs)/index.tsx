import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/stores/appStore';
import { HermesColors } from '@/constants/theme';
import {
  IconChev,
  IconSkills,
  IconMemory,
  IconClock,
  IconBranch,
  IconHermesMark,
  IconSpark,
} from '@/components/ui/Icon';
import Animated, { FadeInUp } from 'react-native-reanimated';

const RECENT = [
  { id: 'r1', text: 'Ranked 4 flat listings for you', time: '2h', skill: 'apartment-scorer' },
  { id: 'r2', text: 'Morning brief delivered via Telegram', time: 'today · 7:00', skill: 'morning-brief' },
  { id: 'r3', text: 'Drafted a reply to David about the rehearsal', time: 'yesterday', skill: null },
];

export default function HomeScreen() {
  const router = useRouter();
  const userName = useAppStore((s) => s.userName);

  const hour = new Date().getHours();
  const greet =
    hour < 5 ? 'Still up' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.kicker}>
            <View style={styles.dot} />
            <Text style={styles.kickerText}>Awake on dusk-vm · Lisbon</Text>
          </View>
          <Text style={styles.greeting}>
            {greet}, <Text style={styles.greetingAccent}>{userName}</Text>.
          </Text>
          <Text style={styles.subtitle}>I did three things overnight and I'm watching two more.</Text>
        </View>

        {/* Continue Chat Card */}
        <TouchableOpacity style={styles.chatCard} onPress={() => router.push('/chat')}>
          <View style={styles.chatCardTop}>
            <Text style={styles.chatCardLabel}>Continue our chat</Text>
            <IconChev size={18} color={HermesColors.accent} />
          </View>
          <Text style={styles.chatCardPreview}>
            "Ranked. The top three are in Graça, Anjos, and Alvalade. Shall I email the agents?"
          </Text>
          <View style={styles.chatCardFoot}>
            <IconHermesMark size={14} color={HermesColors.accent} />
            <Text style={styles.chatCardMeta}>9:03 · awaiting your reply</Text>
          </View>
        </TouchableOpacity>

        {/* Grid */}
        <View style={styles.grid}>
          <TouchableOpacity style={styles.tile} onPress={() => router.push('/(tabs)/skills')}>
            <View style={styles.tileHead}>
              <IconSkills size={18} color={HermesColors.textDim} />
              <Text style={styles.tileLabel}>Skills</Text>
            </View>
            <Text style={styles.tileNum}>12</Text>
            <Text style={styles.tileSub}>2 new this week</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tile} onPress={() => router.push('/(tabs)/memory')}>
            <View style={styles.tileHead}>
              <IconMemory size={18} color={HermesColors.textDim} />
              <Text style={styles.tileLabel}>Memory</Text>
            </View>
            <Text style={styles.tileNum}>47</Text>
            <Text style={styles.tileSub}>entries about you</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tile} onPress={() => router.push('/schedules')}>
            <View style={styles.tileHead}>
              <IconClock size={18} color={HermesColors.textDim} />
              <Text style={styles.tileLabel}>Schedules</Text>
            </View>
            <Text style={styles.tileNum}>5</Text>
            <Text style={styles.tileSub}>next at 7:00 tomorrow</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tile} onPress={() => router.push('/subagents')}>
            <View style={styles.tileHead}>
              <IconBranch size={18} color={HermesColors.textDim} />
              <Text style={styles.tileLabel}>Subagents</Text>
            </View>
            <View style={styles.liveNumWrap}>
              <Text style={[styles.tileNum, styles.tileNumLive]}>2</Text>
              <View style={styles.liveDot} />
            </View>
            <Text style={styles.tileSub}>working right now</Text>
          </TouchableOpacity>
        </View>

        {/* Recently */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>Recently</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/chat')}>
              <Text style={styles.sectionLink}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.list}>
            {RECENT.map((r, i) => (
              <Animated.View
                key={r.id}
                entering={FadeInUp.delay(i * 80)}
                style={[styles.recent, i < RECENT.length - 1 && styles.recentBorder]}>
                <IconHermesMark size={12} color={HermesColors.accent} />
                <View style={styles.recentBody}>
                  <Text style={styles.recentText}>{r.text}</Text>
                  <View style={styles.recentFoot}>
                    {r.skill && <Text style={styles.recentSkill}>{r.skill}</Text>}
                    <Text style={styles.recentTime}>{r.time}</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Learned something new */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>I learned something new</Text>
          </View>
          <View style={styles.learned}>
            <View style={styles.learnedTop}>
              <IconSpark size={14} color={HermesColors.accent} />
              <Text style={styles.learnedLabel}>New skill · Apartment scorer</Text>
            </View>
            <Text style={styles.learnedText}>
              After our last three search sessions I noticed you always break ties the same way:
              balcony &gt; dishwasher &gt; under 30 min to work. I saved that as its own skill so I
              don't have to ask.
            </Text>
            <View style={styles.learnedActions}>
              <TouchableOpacity style={styles.ghostBtnAccent} onPress={() => router.push('/(tabs)/skills')}>
                <Text style={styles.ghostBtnAccentText}>View skill</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn}>
                <Text style={styles.ghostBtnText}>Edit rules</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HermesColors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 20,
  },
  header: {
    paddingHorizontal: 4,
  },
  kicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: HermesColors.good,
    shadowColor: HermesColors.good,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  kickerText: {
    fontSize: 11,
    letterSpacing: 0.7,
    color: HermesColors.textMute,
  },
  greeting: {
    fontFamily: 'Georgia',
    fontSize: 32,
    lineHeight: 38,
    color: HermesColors.text,
    marginTop: 16,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  greetingAccent: {
    color: HermesColors.accent,
    fontStyle: 'italic',
  },
  subtitle: {
    color: HermesColors.textDim,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 240,
  },
  chatCard: {
    backgroundColor: 'rgba(232, 200, 74, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 74, 0.35)',
    borderRadius: 20,
    padding: 18,
    gap: 10,
  },
  chatCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: HermesColors.accent,
  },
  chatCardLabel: {
    color: HermesColors.accent,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  chatCardPreview: {
    fontFamily: 'Georgia',
    fontSize: 19,
    lineHeight: 26,
    color: HermesColors.text,
    marginTop: 2,
  },
  chatCardFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  chatCardMeta: {
    color: HermesColors.textMute,
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    backgroundColor: HermesColors.surface,
    borderWidth: 1,
    borderColor: HermesColors.lineSoft,
    borderRadius: 18,
    padding: 16,
    width: '47.5%',
    gap: 8,
  },
  tileHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tileLabel: {
    color: HermesColors.textDim,
    fontSize: 12,
    fontWeight: '500',
  },
  tileNum: {
    fontFamily: 'Georgia',
    fontSize: 36,
    lineHeight: 38,
    color: HermesColors.text,
  },
  tileNumLive: {
    color: HermesColors.accent,
  },
  liveNumWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: HermesColors.accent,
    marginLeft: 6,
    shadowColor: HermesColors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  tileSub: {
    color: HermesColors.textMute,
    fontSize: 11.5,
  },
  section: {
    gap: 10,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: HermesColors.textMute,
  },
  sectionLink: {
    color: HermesColors.accent,
    fontSize: 12,
  },
  list: {
    backgroundColor: HermesColors.surface,
    borderWidth: 1,
    borderColor: HermesColors.lineSoft,
    borderRadius: 16,
    overflow: 'hidden',
  },
  recent: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    paddingHorizontal: 16,
  },
  recentBorder: {
    borderBottomWidth: 1,
    borderBottomColor: HermesColors.lineSoft,
  },
  recentBody: {
    flex: 1,
  },
  recentText: {
    fontSize: 14,
    lineHeight: 19,
    color: HermesColors.text,
  },
  recentFoot: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  recentSkill: {
    color: HermesColors.accent,
    fontSize: 11,
  },
  recentTime: {
    color: HermesColors.textMute,
    fontSize: 11,
  },
  learned: {
    backgroundColor: HermesColors.surface,
    borderWidth: 1,
    borderColor: HermesColors.lineSoft,
    borderRadius: 16,
    padding: 16,
  },
  learnedTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  learnedLabel: {
    fontSize: 11.5,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: HermesColors.accent,
  },
  learnedText: {
    color: HermesColors.textDim,
    fontSize: 13.5,
    lineHeight: 21,
    marginBottom: 14,
  },
  learnedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  ghostBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: HermesColors.line,
    borderRadius: 10,
  },
  ghostBtnText: {
    color: HermesColors.text,
    fontSize: 12.5,
  },
  ghostBtnAccent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: HermesColors.accentSoft,
    borderRadius: 10,
  },
  ghostBtnAccentText: {
    color: HermesColors.accent,
    fontSize: 12.5,
    fontWeight: '500',
  },
});
