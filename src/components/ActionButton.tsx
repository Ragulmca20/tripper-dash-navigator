import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'md' | 'lg' | 'xl';
};

export const ActionButton: React.FC<Props> = ({
  label, onPress, variant = 'primary', icon, loading, disabled, fullWidth, size = 'md',
}) => {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[variant],
        fullWidth && { alignSelf: 'stretch' },
        pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
        isDisabled && { opacity: 0.5 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.bg : colors.text} />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, variant === 'primary' && { color: colors.bg }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: 'transparent',
  },
  md: { paddingVertical: 12, paddingHorizontal: 16, minHeight: 44 },
  lg: { paddingVertical: 16, paddingHorizontal: 20, minHeight: 56 },
  xl: { paddingVertical: 22, paddingHorizontal: 28, minHeight: 72 },
  primary: { backgroundColor: colors.amber },
  secondary: { backgroundColor: colors.surfaceAlt, borderColor: colors.divider },
  ghost: { backgroundColor: 'transparent', borderColor: colors.divider },
  danger: { backgroundColor: 'transparent', borderColor: colors.danger },
  label: { ...typography.bodyStrong, color: colors.text },
});
