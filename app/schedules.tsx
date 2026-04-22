import React, { useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSchedulesStore } from '@/stores/appStore';
import { HermesColors } from '@/constants/theme';
import {
  IconPlus,
  IconClock,
  IconChev,
} from '@/components/ui/Icon';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';

function parseDraft(t: string) {
  const s = t.toLowerCase();
  if (!s) return null;
  let when = 'Every day at 9:00';
  if (/morning/.test(s)) when = 'Every weekday at 7:00';
  else if (/friday|fri/.test(s)) when = 'Fridays at 16:00';
  else if (/monday|week/.test(s)) when = 'Mondays at 10:00';
  else if (/hour/.test(s)) when = 'Every 4 hours';
  else if (/month/.test(s)) when = 'Monthly, 1st at 9:00';
  const name = t.replace(/^(every|each|on|send me|remind me to|at)\s+/i, '').slice(0, 40);
  return { name: name.charAt(0).toUpperCase() + name.slice(1), cron: when };
}

export default function SchedulesScreen() {
  const { schedules, toggle, add } = useSchedulesStore();
  const [composing, setComposing] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const [parsed, setParsed] = React.useState<{ name: string; cron: string } | null>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const handleDraft = (t: string) => {
    setDraft(t);
    setParsed(parseDraft(t));
  };

  const confirm = () => {
    if (!parsed) return;
    add(parsed.name, parsed.cron);
    setComposing(false);
    setDraft('');
    setParsed(null);
    bottomSheetRef.current?.dismiss();
  };

  const openCompose = useCallback(() => {
    setComposing(true);
    bottomSheetRef.current?.present();
  }, []);

  const snapPoints = useMemo(() => ['55%', '75%'], []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>Automations · {schedules.length}</Text>
            <Text style={styles.title}>
              Things I do <Text style={styles.titleAccent}>on a beat</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={openCompose}>
            <IconPlus size={14} color={HermesColors.bg} />
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {schedules.map((x) => (
            <View key={x.id} style={[styles.item, x.status === 'paused' && styles.itemPaused]}>
              <View style={styles.itemTop}>
                <Text style={styles.itemName}>{x.name}</Text>
                <TouchableOpacity
                  style={[styles.switch, x.status === 'on' && styles.switchOn]}
                  onPress={() => toggle(x.id)}>
                  <View style={[styles.switchKnob, x.status === 'on' && styles.switchKnobOn]} />
                </TouchableOpacity>
              </View>
              <Text style={styles.itemCron}>{x.cron}</Text>
              <View style={styles.itemMeta}>
                <View style={styles.metaItem}>
                  <IconClock size={11} color={HermesColors.textMute} />
                  <Text style={styles.metaText}>next {x.next}</Text>
                </View>
                <Text style={styles.metaText}>→ {x.destination}</Text>
                {x.skill && (
                  <Text style={styles.metaSkill}>
                    uses <Text style={styles.metaSkillCode}>{x.skill}</Text>
                  </Text>
                )}
              </View>
            </View>
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
        <BottomSheetView style={styles.sheet}>
          <View style={styles.sheetGrip} />
          <Text style={styles.sheetTitle}>New schedule</Text>
          <Text style={styles.sheetSub}>Say it like you mean it. I will figure out the cron.</Text>
          <TextInput
            style={styles.memInput}
            multiline
            value={draft}
            onChangeText={handleDraft}
            placeholder="e.g. remind me every Friday afternoon to write the newsletter"
            placeholderTextColor={HermesColors.textMute}
            autoFocus
          />
          {parsed && (
            <View style={styles.parsed}>
              <Text style={styles.parsedLabel}>I heard</Text>
              <View style={styles.parsedLine}>
                <Text style={styles.parsedKey}>name</Text>
                <Text style={styles.parsedValue}>{parsed.name}</Text>
              </View>
              <View style={styles.parsedLine}>
                <Text style={styles.parsedKey}>when</Text>
                <Text style={styles.parsedValue}>{parsed.cron}</Text>
              </View>
              <View style={styles.parsedLine}>
                <Text style={styles.parsedKey}>deliver</Text>
                <Text style={styles.parsedValue}>Push notification</Text>
              </View>
            </View>
          )}
          <View style={styles.sheetFoot}>
            <TouchableOpacity style={styles.ghostBtn} onPress={() => bottomSheetRef.current?.dismiss()}>
              <Text style={styles.ghostBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ghostBtn, styles.ghostBtnAccent]}
              disabled={!parsed}
              onPress={confirm}>
              <Text style={styles.ghostBtnAccentText}>Schedule it</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingBottom: 14,
    gap: 12,
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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: HermesColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
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
  itemPaused: {
    opacity: 0.55,
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: HermesColors.text,
  },
  switch: {
    width: 36,
    height: 22,
    backgroundColor: HermesColors.line,
    borderRadius: 11,
    position: 'relative',
  },
  switchOn: {
    backgroundColor: HermesColors.accent,
  },
  switchKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    position: 'absolute',
    top: 2,
    left: 2,
  },
  switchKnobOn: {
    left: 16,
  },
  itemCron: {
    fontSize: 12,
    color: HermesColors.accent,
    marginTop: 6,
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: HermesColors.textMute,
  },
  metaSkill: {
    fontSize: 11,
    color: HermesColors.textMute,
  },
  metaSkillCode: {
    color: HermesColors.text,
    backgroundColor: HermesColors.bg2,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    fontSize: 11,
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
  sheetTitle: {
    fontFamily: 'Georgia',
    fontSize: 26,
    fontWeight: '400',
    color: HermesColors.text,
    marginTop: 4,
  },
  sheetSub: {
    color: HermesColors.textDim,
    fontSize: 13.5,
    marginBottom: 4,
  },
  memInput: {
    backgroundColor: HermesColors.surface,
    borderWidth: 1,
    borderColor: HermesColors.line,
    color: HermesColors.text,
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  parsed: {
    marginTop: 4,
    padding: 12,
    backgroundColor: HermesColors.bg2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: HermesColors.accent,
    borderRadius: 12,
  },
  parsedLabel: {
    color: HermesColors.accent,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  parsedLine: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 3,
  },
  parsedKey: {
    color: HermesColors.textMute,
    width: 60,
    fontSize: 12,
  },
  parsedValue: {
    color: HermesColors.text,
    fontSize: 12,
    flex: 1,
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
  ghostBtnAccent: {
    backgroundColor: HermesColors.accent,
    borderColor: 'transparent',
  },
  ghostBtnAccentText: {
    color: HermesColors.bg,
    fontSize: 14,
    fontWeight: '600',
  },
});
