import React from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { CompositeNavigationProp, useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, radius, spacing, typography } from '@/theme';
import DashView, { DASH_W, DASH_H } from './DashView';
import { ActionButton } from '@/components/ActionButton';
import { Icon } from '@/components/TabIcon';
import { useConnectionStore } from '@/store/connectionStore';
import { TabParams } from '@/navigation/BottomTabs';
import type { RootStackParams } from '@/navigation/RootNavigator';

type DashPreviewNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParams, 'DashPreview'>,
  BottomTabNavigationProp<TabParams>
>;

export const DashPreviewScreen: React.FC = () => {
  const { params } = useRoute<RouteProp<RootStackParams, 'DashPreview'>>();
  const nav = useNavigation<DashPreviewNavigationProp>();
  const { width } = useWindowDimensions();
  const dash = useConnectionStore((s) => s.dash);
  const dashSsid = useConnectionStore((s) => s.dashSsid);
  const setDash = useConnectionStore((s) => s.setDash);

  // Fit the 526x300 dash inside the phone width with a small margin.
  const scale = Math.min(1, (width - spacing.xl * 2) / DASH_W);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <Text style={styles.eyebrow}>DASH OUTPUT · 526 × 300</Text>
      <Text style={styles.title}>What the rider sees</Text>

      <View style={styles.frame}>
        <View style={[styles.bezelTop, { width: DASH_W * scale }]} />
        <View style={{ width: DASH_W * scale, height: DASH_H * scale, overflow: 'hidden' }}>
          <View style={{ transform: [{ scale }], transformOrigin: '0 0' as any }}>
            <DashView
              etaMin={142}
              remainingKm={87}
              speedKmh={64}
              nextManeuverM={1200}
              nextManeuverLabel="Continue · NH-275"
              headingDeg={-12}
            />
          </View>
        </View>
        <View style={[styles.bezelBottom, { width: DASH_W * scale }]} />
      </View>

      <View style={styles.metaCard}>
        <Row label="STREAM" value={dash === 'connected' ? `LIVE → ${dashSsid}` : 'INACTIVE'} tone={dash === 'connected' ? colors.success : colors.warning} />
        <Row label="RESOLUTION" value="526 × 300 @ 24fps" />
        <Row label="ENCODING" value="JPEG · quality 78" />
        <Row label="ROUTE" value={params?.routeId ?? '—'} />
      </View>

      <ActionButton
        label={dash === 'connected' ? 'Disconnect Dash' : 'Connect via Scanner'}
        variant={dash === 'connected' ? 'primary' : 'secondary'}
        icon={<Icon.Wifi color={dash === 'connected' ? colors.bg : colors.text} />}
        onPress={() => {
          if (dash === 'connected') setDash('disconnected');
          else nav.navigate('Scanner');
        }}
      />
    </ScrollView>
  );
};

const Row: React.FC<{ label: string; value: string; tone?: string }> = ({ label, value, tone }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, tone ? { color: tone } : undefined]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.xl, gap: spacing.lg, paddingBottom: 60 },
  eyebrow: { ...typography.label, color: colors.amber, letterSpacing: 2 },
  title: { ...typography.h1, color: colors.text },
  frame: { alignItems: 'center', gap: 6 },
  bezelTop: { height: 6, backgroundColor: colors.surfaceHi, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  bezelBottom: { height: 6, backgroundColor: colors.surfaceHi, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  metaCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.divider, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.divider },
  rowLabel: { ...typography.label, color: colors.textMuted, letterSpacing: 1 },
  rowValue: { ...typography.bodyStrong, color: colors.text },
});
