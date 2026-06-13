import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

export const EmptyState: React.FC<{ title: string; message: string; cta?: React.ReactNode; icon?: React.ReactNode }> = ({
  title, message, cta, icon,
}) => (
  <View style={styles.wrap}>
    {icon && <View style={styles.iconBox}>{icon}</View>}
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.msg}>{message}</Text>
    {cta}
  </View>
);

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.huge, paddingHorizontal: spacing.xl },
  iconBox: {
    width: 64, height: 64, borderRadius: radius.lg, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.divider, alignItems: 'center', justifyContent: 'center',
  },
  title: { ...typography.h3, color: colors.text, textAlign: 'center' },
  msg: { ...typography.body, color: colors.textMuted, textAlign: 'center', maxWidth: 280 },
});
