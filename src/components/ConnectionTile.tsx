import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';
import { StatusBadge } from './StatusBadge';

type Props = {
  label: string;
  status: 'ok' | 'warn' | 'err' | 'idle';
  detail?: string;
  icon?: React.ReactNode;
};

export const ConnectionTile: React.FC<Props> = ({ label, status, detail, icon }) => {
  const tone = status === 'ok' ? 'success' : status === 'warn' ? 'warning' : status === 'err' ? 'danger' : 'neutral';
  const text = status === 'ok' ? 'ACTIVE' : status === 'warn' ? 'PARTIAL' : status === 'err' ? 'OFFLINE' : 'IDLE';
  return (
    <View style={styles.tile}>
      <View style={styles.head}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
      <StatusBadge tone={tone} label={text} />
      {detail && <Text style={styles.detail}>{detail}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.divider, gap: spacing.md, minHeight: 130,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { ...typography.label, color: colors.textMuted, letterSpacing: 1 },
  detail: { ...typography.caption, color: colors.textDim },
});
