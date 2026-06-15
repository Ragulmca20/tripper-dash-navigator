import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { colors, radius, spacing, typography } from '@/theme';
import { ActionButton } from '@/components/ActionButton';
import { Icon } from '@/components/TabIcon';
import { downloadService } from '@/services/downloadService';
import { useRoutesStore } from '@/store/routesStore';
import type { RootStackParams } from '@/navigation/RootNavigator';

export const DownloadScreen: React.FC = () => {
  const { params } = useRoute<RouteProp<RootStackParams, 'Download'>>();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const route = useRoutesStore((s) => s.getRoute(params.routeId));
  const update = useRoutesStore((s) => s.updateRoute);
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);

  const w = useSharedValue(0);
  const fillStyle = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));

  useEffect(() => {
    let mounted = true;
    update(params.routeId, { status: 'downloading', progress: 0 });
    const downloadPromise = downloadService.downloadRoute(params.routeId, (p) => {
      if (!mounted) return;
      setPct(p);
      w.value = withTiming(p, { duration: 200, easing: Easing.out(Easing.cubic) });
      update(params.routeId, { progress: p });
    });

    downloadPromise
      .then(() => {
        if (!mounted) return;
        setDone(true);
        update(params.routeId, { status: 'ready', progress: 1, downloadedAt: Date.now() });
      })
      .catch((error) => {
        if (!mounted) return;
        console.error('Download failed', error);
        update(params.routeId, { status: 'error', progress: 0 });
        Alert.alert('Download failed', error?.message ?? 'Unable to download route package.');
      });

    return () => { mounted = false; };
  }, [params.routeId, update, w]);

  if (!route) return null;

  return (
    <View style={styles.root}>
      <Text style={styles.eyebrow}>DOWNLOADING PACKAGE</Text>
      <Text style={styles.title}>{route.from.name} → {route.to.name}</Text>

      <View style={styles.bigPct}>
        <Text style={styles.pct}>{Math.round(pct * 100)}</Text>
        <Text style={styles.pctSign}>%</Text>
      </View>

      <View style={styles.bar}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>

      <View style={styles.row}>
        <Cell label="ROUTE" value={`${route.distanceKm.toFixed(0)} km`} />
        <Cell label="CORRIDOR" value="2 km" />
        <Cell label="SIZE" value={`${(route.sizeBytes / 1e6).toFixed(1)} MB`} />
      </View>

      <Text style={styles.stage}>{done ? '✓ Package ready for offline use' : stageFor(pct)}</Text>

      <ActionButton
        label={done ? 'Open Route' : 'Cancel'}
        variant={done ? 'primary' : 'ghost'}
        icon={done ? <Icon.Chevron color={colors.bg} /> : undefined}
        onPress={() => (done ? nav.replace('RouteDetail', { routeId: route.id }) : nav.goBack())}
      />
    </View>
  );
};

const stageFor = (p: number) =>
  p < 0.2 ? 'Resolving route…' :
  p < 0.55 ? 'Fetching corridor tiles…' :
  p < 0.85 ? 'Writing maneuvers…' :
  'Finalising package…';

const Cell: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.cell}>
    <Text style={styles.cellLabel}>{label}</Text>
    <Text style={styles.cellValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, gap: spacing.xl },
  eyebrow: { ...typography.label, color: colors.amber, letterSpacing: 1.5 },
  title: { ...typography.h1, color: colors.text },
  bigPct: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginTop: spacing.xxl },
  pct: { ...typography.display, fontSize: 96, lineHeight: 100, color: colors.text },
  pctSign: { ...typography.h1, color: colors.textMuted, paddingBottom: 16, marginLeft: 4 },
  bar: { height: 6, backgroundColor: colors.surfaceHi, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.amber },
  row: { flexDirection: 'row', gap: spacing.md },
  cell: { flex: 1, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.divider, gap: 4 },
  cellLabel: { ...typography.micro, color: colors.textDim, letterSpacing: 1 },
  cellValue: { ...typography.h3, color: colors.text },
  stage: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
