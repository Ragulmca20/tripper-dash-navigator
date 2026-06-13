import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing, typography } from '@/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Icon } from '@/components/TabIcon';
import { StorageUsageCard } from '@/components/StorageUsageCard';
import { useConnectionStore, DEFAULT_DASH_PASSWORD } from '@/store/connectionStore';
import { useRoutesStore } from '@/store/routesStore';
import type { RootStackParams } from '@/navigation/RootNavigator';

export const SettingsScreen: React.FC = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const { dash, dashSsid, gps } = useConnectionStore();
  const routes = useRoutesStore((s) => s.routes);
  const used = routes.reduce((a, r) => a + r.sizeBytes, 0);
  const [hiAccuracy, setHiAccuracy] = React.useState(true);
  const [bgNav, setBgNav] = React.useState(true);

  return (
    <View style={styles.root}>
      <ScreenHeader eyebrow="SYSTEM" title="Settings" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Group title="Dash Connection">
          <Row label="Status" right={<StatusBadge tone={dash === 'connected' ? 'success' : 'warning'} label={dash.toUpperCase()} />} />
          <Row label="SSID" value={dashSsid ?? '— not paired —'} />
          <Row label="Default password" value={DEFAULT_DASH_PASSWORD} mono />
          <Row label="Pair via Scanner" onPress={() => nav.navigate('Tabs' as never)} chevron />
          <Row label="Preview Dash output" onPress={() => nav.navigate('DashPreview', {})} chevron />
        </Group>

        <Group title="Offline Packages">
          <StorageUsageCard
            usedBytes={used}
            totalBytes={2_000_000_000}
            breakdown={[
              { label: 'Tiles', bytes: Math.round(used * 0.82), tone: colors.amber },
              { label: 'Maneuvers', bytes: Math.round(used * 0.12), tone: colors.electric },
              { label: 'Metadata', bytes: Math.round(used * 0.06), tone: colors.textMuted },
            ]}
          />
          <Row label="Auto-refresh > 14 days old" right={<Switch value={false} onValueChange={() => {}} />} />
          <Row label="Download over Wi-Fi only" right={<Switch value={true} onValueChange={() => {}} />} />
        </Group>

        <Group title="Map Cache">
          <Row label="Render style" value="Tactical · Dark" />
          <Row label="Clear render cache" onPress={() => {}} chevron destructive />
        </Group>

        <Group title="GPS">
          <Row label="Lock" right={<StatusBadge tone={gps === 'locked' ? 'success' : 'warning'} label={gps.toUpperCase()} />} />
          <Row label="High accuracy" right={<Switch value={hiAccuracy} onValueChange={setHiAccuracy} />} />
          <Row label="Background navigation" right={<Switch value={bgNav} onValueChange={setBgNav} />} />
        </Group>

        <Group title="Debug">
          <Row label="View logs" onPress={() => {}} chevron />
          <Row label="Export diagnostics bundle" onPress={() => {}} chevron />
        </Group>

        <Group title="About">
          <Row label="Version" value="0.1.0 · build 001" />
          <Row label="Licenses" onPress={() => {}} chevron />
        </Group>
      </ScrollView>
    </View>
  );
};

const Group: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={{ gap: spacing.sm, marginBottom: spacing.xl }}>
    <Text style={styles.groupTitle}>{title.toUpperCase()}</Text>
    <View style={styles.group}>{children}</View>
  </View>
);

const Row: React.FC<{
  label: string; value?: string; right?: React.ReactNode; onPress?: () => void;
  chevron?: boolean; mono?: boolean; destructive?: boolean;
}> = ({ label, value, right, onPress, chevron, mono, destructive }) => (
  <Pressable
    onPress={onPress} disabled={!onPress}
    style={({ pressed }) => [styles.row, pressed && onPress && { backgroundColor: colors.surfaceAlt }]}
  >
    <Text style={[styles.rowLabel, destructive && { color: colors.danger }]}>{label}</Text>
    {value !== undefined && <Text style={[styles.rowValue, mono && typography.mono]}>{value}</Text>}
    {right}
    {chevron && <Icon.Chevron />}
  </Pressable>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.xl, paddingBottom: 140 },
  groupTitle: { ...typography.label, color: colors.textMuted, letterSpacing: 1.5 },
  group: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.divider, overflow: 'hidden' },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: 14, gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.divider,
  },
  rowLabel: { ...typography.body, color: colors.text, flex: 1 },
  rowValue: { ...typography.body, color: colors.textMuted },
});
