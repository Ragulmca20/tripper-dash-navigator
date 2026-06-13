import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/theme';

export const ScreenHeader: React.FC<{ eyebrow?: string; title: string; right?: React.ReactNode }> = ({
  eyebrow, title, right,
}) => (
  <SafeAreaView edges={['top']} style={styles.safe}>
    <View style={styles.row}>
      <View style={{ flex: 1, gap: 4 }}>
        {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>
      {right}
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.bg },
  row: {
    paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md,
    flexDirection: 'row', alignItems: 'flex-end',
  },
  eyebrow: { ...typography.micro, color: colors.amber, letterSpacing: 2 },
  title: { ...typography.h1, color: colors.text },
});
