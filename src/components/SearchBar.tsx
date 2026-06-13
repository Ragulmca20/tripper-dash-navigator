import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';
import { Icon } from './TabIcon';

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  autoFocus?: boolean;
};

export const SearchBar: React.FC<Props> = ({ value, onChangeText, placeholder = 'Where to?', onSubmit, autoFocus }) => (
  <View style={styles.wrap}>
    <Icon.Pin size={20} color={colors.amber} />
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textDim}
      style={styles.input}
      onSubmitEditing={onSubmit}
      autoFocus={autoFocus}
      returnKeyType="search"
      selectionColor={colors.amber}
    />
    {value.length > 0 && (
      <Pressable onPress={() => onChangeText('')} hitSlop={10}>
        <Text style={styles.clear}>×</Text>
      </Pressable>
    )}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderColor: colors.divider, borderWidth: 1,
    borderRadius: radius.lg, paddingHorizontal: spacing.lg, height: 56,
  },
  input: { flex: 1, color: colors.text, ...typography.body },
  clear: { color: colors.textMuted, fontSize: 24, paddingHorizontal: 4 },
});
