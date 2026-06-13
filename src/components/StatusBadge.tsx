import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'amber' | 'electric';

export const StatusBadge: React.FC<{ label: string; tone?: Tone; dot?: boolean }> = ({
  label, tone = 'neutral', dot = true,
}) => {
  const tint = ({
    neutral: colors.textMuted, success: colors.success, warning: colors.warning,
    danger: colors.danger, amber: colors.amber, electric: colors.electric,
  } as const)[tone];
  return (
    <View style={[styles.wrap, { borderColor: tint + '55' }]}>
      {dot && <View style={[styles.dot, { backgroundColor: tint }]} />}
      <Text style={[styles.label, { color: tint }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: radius.pill, borderWidth: 1, backgroundColor: colors.surface,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { ...typography.micro, letterSpacing: 1 },
});
