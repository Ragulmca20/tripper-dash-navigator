import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography, elevation } from '@/theme';
import type { RoutePackage } from '@/types';
import { StatusBadge } from './StatusBadge';
import { Icon } from './TabIcon';

const fmtSize = (b: number) => (b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} KB`);
const fmtDuration = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`);
const fmtAge = (ts: number) => {
  const d = (Date.now() - ts) / 86_400_000;
  return d < 1 ? 'today' : `${Math.floor(d)}d ago`;
};

export const RouteCard: React.FC<{ route: RoutePackage; onPress?: () => void; onNavigate?: () => void }> = ({
  route, onPress, onNavigate,
}) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}>
    <View style={styles.row}>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={typography.label}>{route.from.name.toUpperCase()} → {route.to.name.toUpperCase()}</Text>
        <Text style={styles.distance}>{route.distanceKm.toFixed(0)} <Text style={styles.unit}>km</Text></Text>
      </View>
      <StatusBadge
        tone={route.status === 'ready' ? 'success' : route.status === 'downloading' ? 'amber' : 'warning'}
        label={route.status === 'ready' ? 'OFFLINE' : route.status.toUpperCase()}
      />
    </View>

    <View style={styles.metaRow}>
      <View style={styles.meta}><Icon.Clock /><Text style={styles.metaTxt}>{fmtDuration(route.durationMin)}</Text></View>
      <View style={styles.meta}><Icon.Download size={14} color={colors.textMuted} /><Text style={styles.metaTxt}>{fmtSize(route.sizeBytes)}</Text></View>
      <View style={styles.meta}><Text style={styles.metaTxt}>· {fmtAge(route.downloadedAt)}</Text></View>
    </View>

    <View style={styles.corridorBar}>
      <View style={[styles.corridorFill, { width: '100%' }]} />
    </View>
    <Text style={styles.corridorTxt}>2 km corridor · maneuvers · metadata</Text>

    {onNavigate && (
      <Pressable onPress={onNavigate} style={styles.cta}>
        <Text style={styles.ctaTxt}>START NAVIGATION</Text>
        <Icon.Chevron color={colors.bg} />
      </Pressable>
    )}
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.divider, gap: spacing.md, ...elevation.card,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  distance: { ...typography.h1, color: colors.text },
  unit: { ...typography.body, color: colors.textMuted },
  metaRow: { flexDirection: 'row', gap: spacing.lg, alignItems: 'center' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaTxt: { ...typography.caption, color: colors.textMuted },
  corridorBar: {
    height: 4, backgroundColor: colors.surfaceHi, borderRadius: 2, overflow: 'hidden',
  },
  corridorFill: { height: '100%', backgroundColor: colors.amber },
  corridorTxt: { ...typography.caption, color: colors.textDim },
  cta: {
    marginTop: spacing.sm, backgroundColor: colors.amber, borderRadius: radius.md,
    paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  ctaTxt: { ...typography.bodyStrong, color: colors.bg, letterSpacing: 0.8 },
});
