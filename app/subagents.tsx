import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSubagentsStore, Subagent } from '@/stores/appStore';
import { HermesColors } from '@/constants/theme';
import {
  IconX,
  IconChev,
} from '@/components/ui/Icon';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';

const LOG = [
  { t: '0s', kind: 'sys', text: 'subagent spawned · own context' },
  { t: '2s', kind: 'tool', text: 'web.search → competitors of Kestrel' },
  { t: '11s', kind: 'tool', text: 'web.extract × 6 pages' },
  { t: '34s', kind: 'thought', text: 'dedup · 4 unique · scoring by overlap with our features' },
  { t: '1m12s', kind: 'tool', text: 'file.write → research/competitors.md' },
  { t: '2m05s', kind: 'thought', text: 'looking at pricing pages' },
];

export default function SubagentsScreen() {
  const { subagents, tick, incrementTick } = useSubagentsStore();
  const [open, setOpen] = React.useState<Subagent | null>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    const t = setInterval(() => {
      incrementTick();
    }, 600);
    return () => clearInterval(t);
  }, [incrementTick]);

  const handleOpen = useCallback((sa: Subagent) => {
    setOpen(sa);
    bottomSheetRef.current?.present();
  }, []);

  const snapPoints = useMemo(() => ['70%', '90%'], []);

  const extra = Math.floor((tick % 20) / 5);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>Subagents · {subagents.length}</Text>
            <Text style={styles.title}>
              My <Text style={styles.titleAccent}>helpers</Text>
            </Text>
            <Text style={styles.subtitle}>
              Isolated runs with their own context. Zero cost to the main chat.
            </Text>
          </View>
        </View>

        <View style={styles.list}>
          {subagents.map((x) => (
            <TouchableOpacity
              key={x.id}
              style={[styles.item, x.status === 'done' && styles.itemDone, x.status === 'paused' && styles.itemPaused]}
              onPress={() => handleOpen(x)}>
              <View style={styles.itemTop}>
                <View style={[styles.statusDot, styles[`status_${x.status}`]]} />
                <Text style={styles.statusText}>{x.status}</Text>
                <Text style={styles.itemSrc}>{x.spawned}</Text>
              </View>
              <Text style={styles.itemTitle}>{x.title}</Text>
              <View style={styles.itemBarBg}>
                <View style={[styles.itemBarFill, { width: `${x.progress * 100}%` }]} />
              </View>
              <View style={styles.itemMeta}>
                <Text style={styles.metaText}>{x.steps} steps</Text>
                <Text style={styles.metaText}>·</Text>
                <Text style={styles.metaText}>{(x.tokens / 1000).toFixed(1)}k tokens</Text>
                <Text style={styles.metaText}>·</Text>
                <Text style={styles.metaText}>started {x.started}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
        )}
        backgroundStyle={{ backgroundColor: HermesColors.bg2 }}
        handleIndicatorStyle={{ backgroundColor: HermesColors.line }}>
        {open && (
          <BottomSheetView style={styles.sheet}>
            <View style={styles.sheetGrip} />
            <View style={styles.sheetHead}>
              <View>
                <Text style={[styles.skillCat, { color: HermesColors.accent }]}>
                  {open.status} · subagent
                </Text>
                <Text style={styles.sheetTitle}>{open.title}</Text>
              </View>
              <TouchableOpacity onPress={() => bottomSheetRef.current?.dismiss()}>
                <IconX size={20} color={HermesColors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Steps</Text>
                <Text style={styles.statValue}>{open.steps + (open.status === 'running' ? extra : 0)}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Tokens</Text>
                <Text style={styles.statValue}>{(open.tokens / 1000).toFixed(1)}k</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Progress</Text>
                <Text style={styles.statValue}>{Math.round(open.progress * 100)}%</Text>
              </View>
            </View>

            <View style={styles.sheetSection}>
              <Text style={styles.sheetLabel}>Live trace</Text>
              <View style={styles.trace}>
                {LOG.map((l, i) => (
                  <View key={i} style={styles.traceRow}>
                    <Text style={styles.traceTime}>{l.t}</Text>
                    <Text style={[
                      styles.traceText,
                      l.kind === 'sys' && styles.traceSys,
                      l.kind === 'tool' && styles.traceTool,
                      l.kind === 'thought' && styles.traceThought,
                    ]}>{l.text}</Text>
                  </View>
                ))}
                {open.status === 'running' && (
                  <View style={styles.traceRow}>
                    <Text style={styles.traceTime}>now</Text>
                    <Text style={styles.traceText}>reading page 3/6</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.sheetFoot}>
              {open.status === 'running' ? (
                <>
                  <TouchableOpacity style={styles.ghostBtn}>
                    <Text style={styles.ghostBtnText}>Pause</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.ghostBtn, { backgroundColor: HermesColors.danger, borderColor: 'transparent' }]}>
                    <Text style={[styles.ghostBtnText, { color: '#fff' }]}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={styles.btnPrimary}>
                  <Text style={styles.btnPrimaryText}>View report</Text>
                  <IconChev size={16} color={HermesColors.bg} />
                </TouchableOpacity>
              )}
            </View>
          </BottomSheetView>
        )}
      </BottomSheetModal>
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
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 14,
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: HermesColors.accent,
    marginBottom: 6,
  },
  title: {
    fontFamily: 'Georgia',
    fontSize: 30,
    fontWeight: '400',
    color: HermesColors.text,
    lineHeight: 33,
    letterSpacing: -0.3,
  },
  titleAccent: {
    color: HermesColors.accent,
    fontStyle: 'italic',
  },
  subtitle: {
    color: HermesColors.textDim,
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 16,
    gap: 10,
  },
  item: {
    backgroundColor: HermesColors.surface,
    borderWidth: 1,
    borderColor: HermesColors.lineSoft,
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 16,
  },
  itemDone: {
    opacity: 0.72,
  },
  itemPaused: {
    opacity: 0.6,
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  status_running: {
    backgroundColor: HermesColors.accent,
    shadowColor: HermesColors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  status_done: {
    backgroundColor: HermesColors.good,
  },
  status_paused: {
    backgroundColor: HermesColors.textMute,
  },
  statusText: {
    fontSize: 10.5,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: HermesColors.textDim,
  },
  itemSrc: {
    marginLeft: 'auto',
    fontSize: 10.5,
    color: HermesColors.textMute,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  itemTitle: {
    fontFamily: 'Georgia',
    fontSize: 19,
    color: HermesColors.text,
    marginVertical: 8,
    lineHeight: 24,
  },
  itemBarBg: {
    height: 3,
    backgroundColor: HermesColors.line,
    borderRadius: 2,
    overflow: 'hidden',
  },
  itemBarFill: {
    height: '100%',
    backgroundColor: HermesColors.accent,
    borderRadius: 2,
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  metaText: {
    fontSize: 11,
    color: HermesColors.textMute,
  },
  sheet: {
    paddingHorizontal: 22,
    paddingBottom: 22,
    gap: 14,
  },
  sheetGrip: {
    width: 40,
    height: 4,
    backgroundColor: HermesColors.line,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  sheetHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  skillCat: {
    fontSize: 10.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: HermesColors.textMute,
    marginBottom: 4,
  },
  sheetTitle: {
    fontFamily: 'Georgia',
    fontSize: 26,
    fontWeight: '400',
    color: HermesColors.text,
    marginTop: 4,
    letterSpacing: -0.3,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 4,
  },
  stat: {
    flex: 1,
    backgroundColor: HermesColors.bg2,
    borderWidth: 1,
    borderColor: HermesColors.lineSoft,
    borderRadius: 12,
    padding: 10,
  },
  statLabel: {
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: HermesColors.textMute,
  },
  statValue: {
    fontFamily: 'Georgia',
    fontSize: 24,
    color: HermesColors.text,
    marginTop: 4,
  },
  sheetSection: {
    borderTopWidth: 1,
    borderTopColor: HermesColors.lineSoft,
    paddingTop: 14,
  },
  sheetLabel: {
    fontSize: 10.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: HermesColors.textMute,
    marginBottom: 10,
  },
  trace: {
    gap: 6,
  },
  traceRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  traceTime: {
    color: HermesColors.textMute,
    fontSize: 12,
    minWidth: 54,
  },
  traceText: {
    fontSize: 12,
    color: HermesColors.textDim,
    flex: 1,
  },
  traceSys: {
    color: HermesColors.textDim,
  },
  traceTool: {
    color: HermesColors.accent,
  },
  traceThought: {
    color: HermesColors.textDim,
    fontStyle: 'italic',
    fontFamily: 'Georgia',
    fontSize: 13,
  },
  sheetFoot: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  ghostBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: HermesColors.line,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  ghostBtnText: {
    color: HermesColors.text,
    fontSize: 14,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: HermesColors.accent,
    borderRadius: 12,
    flex: 1,
  },
  btnPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: HermesColors.bg,
  },
});
