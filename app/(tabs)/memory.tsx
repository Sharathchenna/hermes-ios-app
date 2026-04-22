import React, { useRef, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemoryStore, Memory } from '@/stores/appStore';
import { HermesColors } from '@/constants/theme';
import {
  IconPlus,
  IconX,
} from '@/components/ui/Icon';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';

function EditEntry({ text, onSave, onCancel }: { text: string; onSave: (t: string) => void; onCancel: () => void }) {
  const [val, setVal] = React.useState(text);
  return (
    <View>
      <TextInput
        style={styles.memInput}
        multiline
        value={val}
        onChangeText={setVal}
        autoFocus
      />
      <View style={styles.editActions}>
        <TouchableOpacity style={styles.ghostBtn} onPress={onCancel}>
          <Text style={styles.ghostBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.ghostBtn, styles.ghostBtnAccent]}
          onPress={() => onSave(val)}>
          <Text style={styles.ghostBtnAccentText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function MemoryScreen() {
  const { memories, filter, loading, error, setFilter, remove, update, add, load } = useMemoryStore();
  const [editing, setEditing] = React.useState<string | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    load();
  }, [load]);

  const shown = memories.filter((m) => filter === 'all' || m.kind === filter);

  const openAdd = useCallback(() => {
    setAddOpen(true);
    bottomSheetRef.current?.present();
  }, []);

  const closeAdd = useCallback(() => {
    setAddOpen(false);
    bottomSheetRef.current?.dismiss();
  }, []);

  const snapPoints = useMemo(() => ['50%', '70%'], []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.kicker}>USER.md · PROJECTS.md</Text>
          <Text style={styles.title}>
            What I remember<Text style={styles.titleAccent}> about you</Text>
          </Text>
          <Text style={styles.subtitle}>
            Small, readable, editable. Nothing is secret from you. I will ask before I add anything risky.
          </Text>
        </View>

        {loading && <Text style={styles.statusText}>Loading memory…</Text>}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={load}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.meters}>
          <View style={styles.meter}>
            <Text style={styles.meterLabel}>USER.md</Text>
            <View style={styles.meterBarBg}>
              <View style={[styles.meterBarFill, { width: '62%' }]} />
            </View>
            <Text style={styles.meterNum}>871 / 1,375 chars</Text>
          </View>
          <View style={styles.meter}>
            <Text style={styles.meterLabel}>PROJECTS.md</Text>
            <View style={styles.meterBarBg}>
              <View style={[styles.meterBarFill, { width: '48%' }]} />
            </View>
            <Text style={styles.meterNum}>1,056 / 2,200 chars</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          <View style={styles.filters}>
            {([
              ['all', 'All'],
              ['user', 'About you'],
              ['project', 'Projects'],
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
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <IconPlus size={14} color={HermesColors.bg} />
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {shown.map((m) => (
            <View key={m.id} style={[styles.item, m.kind === 'user' ? styles.itemUser : styles.itemProject]}>
              <Text style={styles.itemKind}>— {m.kind === 'user' ? 'you' : 'project'}</Text>
              {editing === m.id ? (
                <EditEntry
                  text={m.text}
                  onSave={(t) => { update(m.id, t); setEditing(null); }}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <>
                  <Text style={styles.itemText}>{m.text}</Text>
                  <View style={styles.itemFoot}>
                    <Text style={styles.itemMeta}>added {m.added}</Text>
                    <Text style={styles.itemMeta}>·</Text>
                    <Text style={styles.itemMeta}>confidence {Math.round(m.confidence * 100)}%</Text>
                    <View style={styles.itemActions}>
                      <TouchableOpacity onPress={() => setEditing(m.id)}>
                        <Text style={styles.itemAction}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => remove(m.id)}>
                        <Text style={styles.itemAction}>Forget</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
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
          <Text style={styles.sheetTitle}>Tell me something new</Text>
          <TextInput
            style={styles.memInput}
            multiline
            placeholder="e.g. I prefer meetings after 11am."
            placeholderTextColor={HermesColors.textMute}
          />
          <View style={styles.sheetFoot}>
            <TouchableOpacity style={styles.ghostBtn} onPress={closeAdd}>
              <Text style={styles.ghostBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ghostBtn, styles.ghostBtnAccent]} onPress={closeAdd}>
              <Text style={styles.ghostBtnAccentText}>Remember this</Text>
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
    paddingHorizontal: 24,
    paddingBottom: 16,
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
    fontSize: 32,
    fontWeight: '400',
    color: HermesColors.text,
    lineHeight: 34,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  titleAccent: {
    color: HermesColors.accent,
    fontStyle: 'italic',
  },
  subtitle: {
    color: HermesColors.textDim,
    fontSize: 13.5,
    lineHeight: 20,
    maxWidth: 260,
  },
  meters: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  meter: {
    flex: 1,
    backgroundColor: HermesColors.surface,
    borderWidth: 1,
    borderColor: HermesColors.lineSoft,
    borderRadius: 14,
    padding: 12,
  },
  meterLabel: {
    fontSize: 10.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: HermesColors.textMute,
  },
  meterBarBg: {
    height: 4,
    backgroundColor: HermesColors.line,
    borderRadius: 2,
    marginVertical: 8,
    overflow: 'hidden',
  },
  meterBarFill: {
    height: '100%',
    backgroundColor: HermesColors.accent,
    borderRadius: 2,
  },
  meterNum: {
    fontSize: 11,
    color: HermesColors.textDim,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  filters: {
    flexDirection: 'row',
    gap: 6,
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
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: HermesColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 16,
    gap: 8,
  },
  item: {
    backgroundColor: HermesColors.surface,
    borderWidth: 1,
    borderColor: HermesColors.lineSoft,
    borderLeftWidth: 3,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  itemUser: {
    borderLeftColor: HermesColors.accent,
  },
  itemProject: {
    borderLeftColor: '#5AAEE8',
  },
  itemKind: {
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: HermesColors.textMute,
    marginBottom: 4,
  },
  itemText: {
    color: HermesColors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  itemFoot: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  itemMeta: {
    color: HermesColors.textMute,
    fontSize: 11,
  },
  itemActions: {
    marginLeft: 'auto',
    flexDirection: 'row',
    gap: 4,
  },
  itemAction: {
    color: HermesColors.textMute,
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  memInput: {
    backgroundColor: HermesColors.surface,
    borderWidth: 1,
    borderColor: HermesColors.line,
    color: HermesColors.text,
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
    marginTop: 8,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  editActions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    justifyContent: 'flex-end',
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
    backgroundColor: HermesColors.accent,
    borderColor: 'transparent',
  },
  ghostBtnAccentText: {
    color: HermesColors.bg,
    fontSize: 12.5,
    fontWeight: '500',
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
    fontSize: 24,
    fontWeight: '400',
    color: HermesColors.text,
    marginBottom: 4,
  },
  sheetFoot: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
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
