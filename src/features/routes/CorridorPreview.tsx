import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Path, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { colors, radius, spacing, typography } from '@/theme';

/**
 * Stylised preview of the downloaded corridor.
 * No external map tiles — pure SVG. The actual nav screen will render real tiles.
 */
export const CorridorPreview: React.FC = () => (
  <View style={styles.wrap}>
    <Svg width="100%" height={220} viewBox="0 0 360 220">
      <Defs>
        <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#16181C" />
          <Stop offset="1" stopColor="#0B0C0E" />
        </LinearGradient>
        <LinearGradient id="cor" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={colors.amber} stopOpacity={0.15} />
          <Stop offset="1" stopColor={colors.amber} stopOpacity={0.05} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="360" height="220" fill="url(#bg)" rx={12} />
      {/* faint grid */}
      {Array.from({ length: 10 }).map((_, i) => (
        <Path key={`v${i}`} d={`M${i * 40} 0 V220`} stroke="#1E2126" strokeWidth={0.5} />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <Path key={`h${i}`} d={`M0 ${i * 40} H360`} stroke="#1E2126" strokeWidth={0.5} />
      ))}
      {/* corridor halo */}
      <Path
        d="M20 170 C 80 150, 110 90, 180 100 S 300 60, 340 40"
        stroke="url(#cor)" strokeWidth={36} fill="none" strokeLinecap="round"
      />
      {/* route line */}
      <Path
        d="M20 170 C 80 150, 110 90, 180 100 S 300 60, 340 40"
        stroke={colors.amber} strokeWidth={3} fill="none" strokeLinecap="round"
      />
      {/* endpoints */}
      <Circle cx={20} cy={170} r={6} fill={colors.amber} />
      <Circle cx={20} cy={170} r={12} fill={colors.amber} fillOpacity={0.18} />
      <Circle cx={340} cy={40} r={6} fill={colors.electric} />
      <Circle cx={340} cy={40} r={12} fill={colors.electric} fillOpacity={0.18} />
    </Svg>
    <View style={styles.legendRow}>
      <Legend swatch={colors.amber} label="ROUTE" />
      <Legend swatch={colors.amber + '33'} label="2 KM CORRIDOR" />
      <Legend swatch={colors.electric} label="DESTINATION" />
    </View>
  </View>
);

const Legend: React.FC<{ swatch: string; label: string }> = ({ swatch, label }) => (
  <View style={styles.legend}>
    <View style={[styles.swatch, { backgroundColor: swatch }]} />
    <Text style={styles.legendTxt}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.divider, gap: spacing.md,
  },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, paddingHorizontal: 4 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 12, height: 3, borderRadius: 2 },
  legendTxt: { ...typography.micro, color: colors.textMuted, letterSpacing: 1 },
});
