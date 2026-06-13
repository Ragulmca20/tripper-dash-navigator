import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '@/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { RouteCard } from '@/components/RouteCard';
import { StorageUsageCard } from '@/components/StorageUsageCard';
import { EmptyState } from '@/components/EmptyState';
import { ActionButton } from '@/components/ActionButton';
import { Icon } from '@/components/TabIcon';
import { useRoutesStore } from '@/store/routesStore';
import type { RootStackParams } from '@/navigation/RootNavigator';

const TOTAL_QUOTA = 2_000_000_000; // 2 GB cap for offline packages

export const RoutesScreen: React.FC = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const routes = useRoutesStore((s) => s.routes);
  const used = routes.reduce((a, r) => a + r.sizeBytes, 0);

  return (
    <View style={styles.root}>
      <ScreenHeader eyebrow="OFFLINE PACKAGES" title="Your routes" />
      {routes.length === 0 ? (
        <EmptyState
          icon={<Icon.Download size={28} />}
          title="No saved routes"
          message="Pick a destination from Search and download a corridor package for offline navigation."
          cta={<ActionButton label="Search destination" onPress={() => nav.navigate('Tabs', { screen: 'Search' } as never)} />}
        />
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListHeaderComponent={
            <View style={{ gap: spacing.lg, marginBottom: spacing.lg }}>
              <StorageUsageCard
                usedBytes={used}
                totalBytes={TOTAL_QUOTA}
                breakdown={[
                  { label: 'Route tiles', bytes: Math.round(used * 0.82), tone: colors.amber },
                  { label: 'Maneuvers', bytes: Math.round(used * 0.12), tone: colors.electric },
                  { label: 'Metadata', bytes: Math.round(used * 0.06), tone: colors.textMuted },
                ]}
              />
              <Text style={styles.hint}>Packages contain only a 2 km corridor around each route — not entire cities.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <RouteCard
              route={item}
              onPress={() => nav.navigate('RouteDetail', { routeId: item.id })}
              onNavigate={() => nav.navigate('NavigationMap', { routeId: item.id })}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.xl, paddingBottom: 140 },
  hint: { color: colors.textDim, fontSize: 12, lineHeight: 18 },
});
