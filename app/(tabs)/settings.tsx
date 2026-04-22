import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/stores/appStore';
import { HermesColors, getAccentColor } from '@/constants/theme';
import { IconHermesMark } from '@/components/ui/Icon';

function Group({ label, children, danger }: { label: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <View style={styles.group}>
      <Text style={[styles.groupLabel, danger && styles.groupLabelDanger]}>{label}</Text>
      <View style={styles.groupBody}>{children}</View>
    </View>
  );
}

function Row({ label, value, meta, danger }: { label: string; value: string; meta?: string; danger?: boolean }) {
  return (
    <View style={[styles.row, danger && styles.rowDanger]}>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      <View style={styles.rowRight}>
        <Text style={styles.rowValue}>{value}</Text>
        {meta && <Text style={styles.rowMeta}>{meta}</Text>}
      </View>
    </View>
  );
}

function ToggleRow({
  label,
  sub,
  on,
  onChange,
}: {
  label: string;
  sub?: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <TouchableOpacity style={styles.toggle} onPress={() => onChange(!on)}>
      <View style={{ flex: 1 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {sub && <Text style={styles.toggleSub}>{sub}</Text>}
      </View>
      <Switch
        value={on}
        onValueChange={onChange}
        trackColor={{ false: HermesColors.line, true: HermesColors.accent }}
        thumbColor="#fff"
      />
    </TouchableOpacity>
  );
}

const PLATFORMS = [
  { n: 'Telegram', on: true },
  { n: 'Discord', on: true },
  { n: 'Slack', on: false },
  { n: 'WhatsApp', on: true },
  { n: 'Signal', on: false },
  { n: 'Email', on: true },
];

const ACCENTS = [55, 30, 200, 280, 140];

export default function SettingsScreen() {
  const { accentHue, setAccentHue, density, setDensity, userName } = useAppStore();
  const [notifs, setNotifs] = React.useState(true);
  const [autoSkills, setAutoSkills] = React.useState(true);
  const [nudges, setNudges] = React.useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Profile */}
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>M</Text>
          </View>
          <View>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileSub}>maya@hermes · Lisbon · since Jan 2026</Text>
          </View>
        </View>

        <Group label="Model">
          <Row label="Primary provider" value="Nous Portal" meta="OAuth · claude-haiku-4-5" />
          <Row label="Fallback" value="OpenRouter" meta="sonnet-4 · for hard tasks" />
          <Row label="Monthly spend" value="$12.40" meta="budget $40 · on track" />
        </Group>

        <Group label="Reach">
          <View style={styles.platformGrid}>
            {PLATFORMS.map((p) => (
              <View key={p.n} style={[styles.platChip, p.on && styles.platChipOn]}>
                <View style={[styles.platDot, p.on && styles.platDotOn]} />
                <Text style={[styles.platText, p.on && styles.platTextOn]}>{p.n}</Text>
              </View>
            ))}
          </View>
        </Group>

        <Group label="Backend">
          <Row label="Runs on" value="dusk-vm · Daytona" meta="awake · $3/mo idle" />
          <Row label="Region" value="eu-west" />
        </Group>

        <Group label="Behavior">
          <ToggleRow
            label="Self-written skills"
            sub="Save reusable approaches automatically"
            on={autoSkills}
            onChange={setAutoSkills}
          />
          <ToggleRow
            label="Memory nudges"
            sub="Ask me before updating what you know"
            on={nudges}
            onChange={setNudges}
          />
          <ToggleRow label="Push notifications" on={notifs} onChange={setNotifs} />
        </Group>

        <Group label="Appearance">
          <Text style={styles.subLabel}>Accent</Text>
          <View style={styles.accentRow}>
            {ACCENTS.map((h) => (
              <TouchableOpacity
                key={h}
                style={[styles.accentSwatch, accentHue === h && styles.accentSwatchActive]}
                onPress={() => setAccentHue(h)}>
                <View style={[styles.accentDot, { backgroundColor: getAccentColor(h) }]} />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.subLabel, { marginTop: 14 }]}>Density</Text>
          <View style={styles.seg}>
            {(['compact', 'comfortable'] as const).map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.segBtn, density === d && styles.segBtnActive]}
                onPress={() => setDensity(d)}>
                <Text style={[styles.segText, density === d && styles.segTextActive]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Group>

        <Group label="Danger zone" danger>
          <Row label="Export all memories" value=".md files" />
          <Row label="Forget everything" value="irreversible" danger />
        </Group>

        <View style={styles.foot}>
          <IconHermesMark size={16} color={HermesColors.accent} />
          <Text style={styles.footText}>Hermes iOS · build 0.4 · open source · MIT</Text>
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
    paddingBottom: 32,
  },
  profile: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 18,
    paddingTop: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: HermesColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Georgia',
    fontSize: 26,
    color: HermesColors.bg,
  },
  profileName: {
    fontFamily: 'Georgia',
    fontSize: 22,
    color: HermesColors.text,
    letterSpacing: -0.3,
  },
  profileSub: {
    color: HermesColors.textMute,
    fontSize: 11,
    marginTop: 2,
  },
  group: {
    marginBottom: 16,
  },
  groupLabel: {
    fontSize: 10.5,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: HermesColors.textMute,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  groupLabelDanger: {
    color: HermesColors.danger,
  },
  groupBody: {
    backgroundColor: HermesColors.surface,
    borderWidth: 1,
    borderColor: HermesColors.lineSoft,
    borderRadius: 14,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: HermesColors.lineSoft,
    gap: 10,
  },
  rowDanger: {
    borderBottomColor: 'rgba(232, 96, 80, 0.2)',
  },
  rowLabel: {
    fontSize: 14,
    color: HermesColors.text,
  },
  rowLabelDanger: {
    color: HermesColors.danger,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  rowValue: {
    fontSize: 14,
    color: HermesColors.text,
  },
  rowMeta: {
    fontSize: 11,
    color: HermesColors.textMute,
    marginTop: 2,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
    padding: 10,
  },
  platChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    width: '33%',
  },
  platChipOn: {
    backgroundColor: HermesColors.accentSoft,
  },
  platDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: HermesColors.textMute,
  },
  platDotOn: {
    backgroundColor: HermesColors.good,
  },
  platText: {
    fontSize: 12,
    color: HermesColors.textMute,
  },
  platTextOn: {
    color: HermesColors.text,
  },
  toggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: HermesColors.lineSoft,
    gap: 16,
  },
  toggleLabel: {
    fontSize: 14,
    color: HermesColors.text,
  },
  toggleSub: {
    color: HermesColors.textMute,
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  subLabel: {
    fontSize: 10.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: HermesColors.textMute,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 10,
  },
  accentRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 24,
    paddingBottom: 14,
  },
  accentSwatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentSwatchActive: {
    borderColor: HermesColors.text,
  },
  accentDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  seg: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 14,
    backgroundColor: HermesColors.bg2,
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  segBtnActive: {
    backgroundColor: HermesColors.surface,
  },
  segText: {
    fontSize: 13,
    color: HermesColors.textMute,
    textTransform: 'capitalize',
  },
  segTextActive: {
    color: HermesColors.text,
  },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 18,
  },
  footText: {
    color: HermesColors.textMute,
    fontSize: 10.5,
  },
});
