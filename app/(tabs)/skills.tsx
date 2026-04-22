import React, { useCallback, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSkillsStore, Skill } from '@/stores/appStore';
import { HermesColors } from '@/constants/theme';
import {
  IconSearch,
  IconSpark,
  IconX,
  IconChev,
} from '@/components/ui/Icon';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';

export default function SkillsScreen() {
  const { skills, query, filter, loading, error, setQuery, setFilter, load } = useSkillsStore();
  const [openSkill, setOpenSkill] = React.useState<Skill | null>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = skills.filter((s) => {
    if (filter === 'auto' && !s.auto) return false;
    if (filter === 'mine' && s.auto) return false;
    if (query && !(s.name + s.desc + s.category).toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const handleOpenSkill = useCallback((skill: Skill) => {
    setOpenSkill(skill);
    bottomSheetRef.current?.present();
  }, []);

  const snapPoints = useMemo(() => ['60%', '85%'], []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Skills · {skills.length}</Text>
          <Text style={styles.title}>What I can do</Text>
          <Text style={styles.subtitle}>
            I wrote nine of these myself. Tap any to see how I would approach it.
          </Text>
        </View>

        <View style={styles.search}>
          <IconSearch size={16} color={HermesColors.textMute} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search skills"
            placeholderTextColor={HermesColors.textMute}
          />
        </View>

        <View style={styles.filters}>
          {([
            ['all', 'All'],
            ['auto', 'Self-learned'],
            ['mine', 'I wrote'],
          ] as const).map(([id, label]) => (
            <TouchableOpacity
              key={id}
              style={[styles.filter, filter === id && styles.filterActive]}
              onPress={() => setFilter(id)}>
              <Text style={[styles.filterText, filter === id && styles.filterTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && <Text style={styles.statusText}>Loading skills…</Text>}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={load}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.list}>
          {filtered.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={styles.skill}
              onPress={() => handleOpenSkill(s)}>
              <View style={styles.skillTop}>
                <Text style={styles.skillCat}>{s.category}</Text>
                {s.auto && (
                  <View style={styles.skillAuto}>
                    <IconSpark size={10} color={HermesColors.accent} />
                    <Text style={styles.skillAutoText}>self-learned</Text>
                  </View>
                )}
              </View>
              <Text style={styles.skillName}>{s.name}</Text>
              <Text style={styles.skillDesc}>{s.desc}</Text>
              <View style={styles.skillStats}>
                <Text style={styles.skillStat}>
                  <Text style={styles.skillStatBold}>{s.uses}</Text> uses
                </Text>
                <Text style={styles.skillStat}>
                  <Text style={styles.skillStatBold}>v{s.improved}</Text> revisions
                </Text>
                <Text style={styles.skillStat}>{s.learned}</Text>
              </View>
              <View style={styles.confBarWrap}>
                <View style={styles.confBarBg}>
                  <View style={[styles.confBarFill, { width: `${s.confidence * 100}%` }]} />
                </View>
                <Text style={styles.confText}>{Math.round(s.confidence * 100)}%</Text>
              </View>
            </TouchableOpacity>
          ))}
          {filtered.length === 0 && (
            <Text style={styles.empty}>No skills match your search.</Text>
          )}
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
        {openSkill && (
          <BottomSheetView style={styles.sheet}>
            <View style={styles.sheetGrip} />
            <View style={styles.sheetHead}>
              <View>
                <Text style={styles.skillCat}>{openSkill.category}</Text>
                <Text style={styles.sheetTitle}>{openSkill.name}</Text>
              </View>
              <TouchableOpacity onPress={() => bottomSheetRef.current?.dismiss()}>
                <IconX size={20} color={HermesColors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.sheetDesc}>{openSkill.desc}</Text>

            <View style={styles.sheetSection}>
              <Text style={styles.sheetLabel}>How I approach it</Text>
              <View style={styles.steps}>
                <Text style={styles.step}>1. Load context from USER.md and prior similar tasks</Text>
                <Text style={styles.step}>2. Fan out: {openSkill.tools.join(' ')}</Text>
                <Text style={styles.step}>3. Score against your revealed preferences</Text>
                <Text style={styles.step}>4. Return shortest useful answer; ask only if ambiguous</Text>
              </View>
            </View>

            <View style={styles.sheetSection}>
              <Text style={styles.sheetLabel}>Revisions</Text>
              <View style={styles.revision}>
                <View style={styles.revisionHead}>
                  <Text style={styles.revisionVer}>v{openSkill.improved}</Text>
                  <Text style={styles.revisionDate}>last week</Text>
                </View>
                <Text style={styles.revisionText}>
                  Started also checking 30-day rent trend after you corrected me twice.
                </Text>
              </View>
              <View style={styles.revision}>
                <View style={styles.revisionHead}>
                  <Text style={styles.revisionVer}>v{Math.max(openSkill.improved - 1, 1)}</Text>
                  <Text style={styles.revisionDate}>1 month ago</Text>
                </View>
                <Text style={styles.revisionText}>Added balcony as a soft requirement.</Text>
              </View>
            </View>

            <View style={styles.sheetFoot}>
              <TouchableOpacity style={styles.ghostBtn}>
                <Text style={styles.ghostBtnText}>Edit rules</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary}>
                <Text style={styles.btnPrimaryText}>Run now</Text>
                <IconChev size={16} color={HermesColors.bg} />
              </TouchableOpacity>
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
    paddingBottom: 12,
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
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: HermesColors.textDim,
    fontSize: 13.5,
    lineHeight: 19,
  },
  search: {
    marginHorizontal: 20,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: HermesColors.surface,
    borderWidth: 1,
    borderColor: HermesColors.lineSoft,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    color: HermesColors.text,
    fontSize: 14,
  },
  filters: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  filter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: HermesColors.line,
    borderRadius: 999,
  },
  filterActive: {
    backgroundColor: HermesColors.accent,
    borderColor: HermesColors.accent,
  },
  filterText: {
    color: HermesColors.textDim,
    fontSize: 12.5,
  },
  filterTextActive: {
    color: '#1a1208',
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: 16,
    gap: 10,
  },
  skill: {
    backgroundColor: HermesColors.surface,
    borderWidth: 1,
    borderColor: HermesColors.lineSoft,
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },
  skillTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillCat: {
    fontSize: 10.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: HermesColors.textMute,
  },
  skillAuto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: HermesColors.accentSoft,
    borderRadius: 999,
  },
  skillAutoText: {
    fontSize: 10,
    color: HermesColors.accent,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  skillName: {
    fontFamily: 'Georgia',
    fontSize: 20,
    lineHeight: 23,
    color: HermesColors.text,
    marginVertical: 2,
  },
  skillDesc: {
    color: HermesColors.textDim,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 6,
  },
  skillStats: {
    flexDirection: 'row',
    gap: 14,
  },
  skillStat: {
    fontSize: 11,
    color: HermesColors.textMute,
  },
  skillStatBold: {
    color: HermesColors.text,
    fontWeight: '500',
  },
  confBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  confBarBg: {
    flex: 1,
    height: 3,
    backgroundColor: HermesColors.line,
    borderRadius: 2,
    overflow: 'hidden',
  },
  confBarFill: {
    height: '100%',
    backgroundColor: HermesColors.accent,
    borderRadius: 2,
  },
  confText: {
    fontSize: 10,
    color: HermesColors.textMute,
  },
  empty: {
    padding: 40,
    textAlign: 'center',
    color: HermesColors.textMute,
    fontSize: 13,
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
  sheetTitle: {
    fontFamily: 'Georgia',
    fontSize: 26,
    fontWeight: '400',
    color: HermesColors.text,
    marginTop: 4,
    letterSpacing: -0.3,
  },
  sheetDesc: {
    color: HermesColors.textDim,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 4,
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
  steps: {
    gap: 6,
  },
  step: {
    color: HermesColors.text,
    fontSize: 14,
    lineHeight: 22,
  },
  stepCode: {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: HermesColors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    color: HermesColors.accent,
  },
  revision: {
    marginBottom: 10,
  },
  revisionHead: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'baseline',
  },
  revisionVer: {
    color: HermesColors.accent,
    fontWeight: '500',
    fontSize: 13,
  },
  revisionDate: {
    color: HermesColors.textMute,
    fontSize: 11,
  },
  revisionText: {
    color: HermesColors.textDim,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
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
    flex: 2,
  },
  btnPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: HermesColors.bg,
  },
  statusText: {
    textAlign: 'center',
    color: HermesColors.textMute,
    fontSize: 13,
    paddingVertical: 20,
  },
  errorBox: {
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  errorText: {
    color: HermesColors.danger,
    fontSize: 13,
    textAlign: 'center',
  },
  retryText: {
    color: HermesColors.accent,
    fontSize: 13,
    fontWeight: '500',
  },
});
