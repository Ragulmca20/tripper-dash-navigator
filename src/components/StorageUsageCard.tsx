import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

type Props = { usedBytes: number; totalBytes: number; breakdown?: { label: string; bytes: number; tone: string }[] };

const fmt = (b: number) => (b >= 1e9 ? `${(b / 1e9).toFixed(2)} GB` : `${(b / 1e6).toFixed(1)} MB`);

export const StorageUsageCard: React.FC<Props> = ({ usedBytes, totalBytes, breakdown = [] }) => {
  const pct = Math.min(1, usedBytes / totalBytes);
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>OFFLINE STORAGE</Text>
        <Text style={styles.value}>{fmt(usedBytes)} <Text style={styles.dim}>/ {fmt(totalBytes)}</Text></Text>
      </View>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>
      <View style={styles.legend}>
        {breakdown.map((b) => (
          <View key={b.label} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: b.tone }]} />
            <Text style={styles.legendTxt}>{b.label} · {fmt(b.bytes)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.divider, gap: spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  title: { ...typography.label, color: colors.textMuted, letterSpacing: 1 },
  value: { ...typography.h3, color: colors.text },
  dim: { color: colors.textDim, ...typography.body },
  bar: { height: 8, backgroundColor: colors.surfaceHi, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.amber },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: 2 },
  legendTxt: { ...typography.caption, color: colors.textMuted },
});
