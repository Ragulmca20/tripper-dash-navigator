import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { colors, radius } from '@/theme';

export const Skeleton: React.FC<{ height?: number; width?: number | `${number}%`; style?: ViewStyle }> = ({
  height = 16, width = '100%', style,
}) => {
  const v = useSharedValue(0.4);
  useEffect(() => {
    v.value = withRepeat(withTiming(0.9, { duration: 900 }), -1, true);
  }, [v]);
  const animated = useAnimatedStyle(() => ({ opacity: v.value }));
  return (
    <Animated.View
      style={[{ height, width, backgroundColor: colors.surfaceHi, borderRadius: radius.sm }, animated, style]}
    />
  );
};

export const SkeletonCard = () => (
  <View style={styles.card}>
    <Skeleton width="40%" height={12} />
    <Skeleton width="70%" height={28} style={{ marginTop: 12 }} />
    <Skeleton width="100%" height={4} style={{ marginTop: 16 }} />
    <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
      <Skeleton width={60} height={10} />
      <Skeleton width={80} height={10} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16,
    borderWidth: 1, borderColor: colors.divider,
  },
});
