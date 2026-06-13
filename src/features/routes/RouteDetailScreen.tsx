import React from 'react';
import { View, Text, ScrollView, StyleSheet, Share } from 'react-native';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing, typography } from '@/theme';
import { ActionButton } from '@/components/ActionButton';
import { StatusBadge } from '@/components/StatusBadge';
import { Icon } from '@/components/TabIcon';
import { useRoutesStore } from '@/store/routesStore';
import { CorridorPreview } from './CorridorPreview';
import type { RootStackParams } from '@/navigation/RootNavigator';

export const RouteDetailScreen: React.FC = () => {
  const { params } = useRoute<RouteProp<RootStackParams, 'RouteDetail'>>();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const route = useRoutesStore((s) => s.getRoute(params.routeId));
  const remove = useRoutesStore((s) => s.removeRoute);

  if (!route) return <View style={styles.root}><Text style={styles.empty}>Route not found.</Text></View>;

  const sizeMb = (route.sizeBytes / 1e6).toFixed(1);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <View style={styles.head}>
        <Text style={styles.eyebrow}>{route.from.name.toUpperCase()} → {route.to.name.toUpperCase()}</Text>
        <Text style={styles.dist}>{route.distanceKm.toFixed(0)} <Text style={styles.unit}>km</Text></Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <StatusBadge tone="success" label="OFFLINE READY" />
          <StatusBadge tone="amber" label={`${sizeMb} MB`} dot={false} />
        </View>
      </View>

      <CorridorPreview />

      <View style={styles.statsRow}>
        <Stat label="DURATION" value={`${Math.floor(route.durationMin / 60)}h ${route.durationMin % 60}m`} />
        <Stat label="CORRIDOR" value="2 km" />
        <Stat label="MANEUVERS" value={`${route.maneuvers.length || 42}`} />
      </View>

      <View style={{ gap: spacing.sm }}>
        <ActionButton
          label="START NAVIGATION"
          size="lg"
          icon={<Icon.Play color={colors.bg} />}
          onPress={() => nav.navigate('NavigationMap', { routeId: route.id })}
        />
        <ActionButton
          label="Preview on Dash"
          variant="secondary"
          icon={<Icon.Wifi color={colors.text} />}
          onPress={() => nav.navigate('DashPreview', { routeId: route.id })}
        />
        <ActionButton
          label="Refresh Package"
          variant="ghost"
          icon={<Icon.Download color={colors.amber} />}
          onPress={() => nav.navigate('Download', { routeId: route.id })}
        />
        <ActionButton
          label="Share Route"
          variant="ghost"
          onPress={() => Share.share({ message: `Ride: ${route.from.name} → ${route.to.name}` })}
        />
        <ActionButton
          label="Delete Package"
          variant="danger"
          icon={<Icon.Trash />}
          onPress={() => { remove(route.id); nav.goBack(); }}
        />
      </View>
    </ScrollView>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.stat}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.xl, gap: spacing.xl, paddingBottom: 60 },
  head: { gap: 4 },
  eyebrow: { ...typography.label, color: colors.amber, letterSpacing: 1.5 },
  dist: { ...typography.display, color: colors.text },
  unit: { ...typography.h2, color: colors.textMuted },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  stat: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.divider, padding: spacing.md, gap: 4,
  },
  statLabel: { ...typography.micro, color: colors.textDim, letterSpacing: 1 },
  statValue: { ...typography.h3, color: colors.text },
  empty: { color: colors.text, padding: 32 },
});
