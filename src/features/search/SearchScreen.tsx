import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing, typography } from '@/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '@/components/SearchBar';
import { Icon } from '@/components/TabIcon';
import { useRoutesStore } from '@/store/routesStore';
import * as Location from 'expo-location';
import { placeService } from '@/services/placeService';
import type { Place } from '@/types';
import type { RootStackParams } from '@/navigation/RootNavigator';


export const SearchScreen: React.FC = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const [q, setQ] = useState('');
  const { recent, favorites, addRecent, addRoute } = useRoutesStore();

  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const preds = await placeService.autocomplete(q);
        // Map to lightweight Place-like items (will fetch full details on select)
        setResults(preds.map((p: any) => ({ id: p.place_id, name: p.description, coord: { lat: 0, lng: 0 } } as Place)));
      } catch (e: any) {
        const msg = e?.message ?? String(e);
        console.warn('Places autocomplete failed', msg);
        setResults([]);
        if (msg.toLowerCase().includes('api key') || msg.toLowerCase().includes('not configured')) {
          Alert.alert('Places not configured', 'Google Maps API key not found. Set GOOGLE_MAPS_API_KEY in your environment or Expo config.');
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const openRoute = async (p: Place) => {
    addRecent(p);
    try {
      setLoading(true);
      const details = await placeService.getPlaceDetails(p.id);

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const startPlace: Place = { id: 'current', name: 'Current location', coord: { lat: loc.coords.latitude, lng: loc.coords.longitude } };

      const dirs = await placeService.directions(startPlace.coord, details.coord);

      const routeId = `r_${Date.now()}`;
      const routePkg: import('@/types').RoutePackage = {
        id: routeId,
        from: startPlace,
        to: details,
        distanceKm: (dirs.distanceMeters ?? 0) / 1000,
        durationMin: (dirs.durationSec ?? 0) / 60,
        polyline: dirs.polyline as any,
        maneuvers: [],
        corridorRadiusM: 2000,
        sizeBytes: 0,
        downloadedAt: 0,
        status: 'queued',
      };

      addRecent(details);
      addRoute(routePkg);
      nav.navigate('Download', { routeId });
    } catch (e: any) {
      Alert.alert('Routing failed', e?.message ?? 'Could not resolve route');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScreenHeader eyebrow="DESTINATION" title="Where to ride?" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SearchBar value={q} onChangeText={setQ} autoFocus={false} />

        {q.length > 0 ? (
          <Section title="Results">
            <FlatList
              scrollEnabled={false}
              data={results}
              keyExtractor={(p) => p.id}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.divider }} />}
              renderItem={({ item }) => <PlaceRow place={item} onPress={() => openRoute(item)} />}
              ListEmptyComponent={<Text style={styles.empty}>No matches. Try a town, road, or landmark.</Text>}
            />
            {loading && <ActivityIndicator style={{ marginTop: 8 }} color={colors.amber} />}
          </Section>
        ) : (
          <>
            <Section title="Favorites">
              <View style={styles.chipsRow}>
                {favorites.map((f) => (
                  <Pressable key={f.id} onPress={() => openRoute(f)} style={styles.chip}>
                    <Icon.Star filled size={14} />
                    <Text style={styles.chipTxt}>{f.name}</Text>
                  </Pressable>
                ))}
              </View>
            </Section>

            <Section title="Recent">
              {recent.map((r) => (
                <PlaceRow key={r.id} place={r} onPress={() => openRoute(r)} />
              ))}
            </Section>

          </>
        )}
      </ScrollView>
    </View>
  );
};

const PlaceRow: React.FC<{ place: Place; onPress: () => void; amber?: boolean }> = ({ place, onPress, amber }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceAlt }]}>
    <View style={[styles.rowIcon, amber && { borderColor: colors.amber + '55' }]}>
      <Icon.Pin color={amber ? colors.amber : colors.textMuted} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.rowTitle}>{place.name}</Text>
      {place.subtitle && <Text style={styles.rowSub}>{place.subtitle}</Text>}
    </View>
    <Icon.Chevron />
  </Pressable>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={{ gap: spacing.sm }}>
    <Text style={styles.section}>{title.toUpperCase()}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.xl, gap: spacing.xl, paddingBottom: 120 },
  section: { ...typography.label, color: colors.textMuted, letterSpacing: 1.5 },
  empty: { ...typography.body, color: colors.textDim, padding: spacing.lg },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surface, borderColor: colors.divider, borderWidth: 1,
    borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 8,
  },
  chipTxt: { ...typography.bodyStrong, color: colors.text },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 12,
    paddingHorizontal: 4, borderRadius: radius.md,
  },
  rowIcon: {
    width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: colors.divider,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface,
  },
  rowTitle: { ...typography.bodyStrong, color: colors.text },
  rowSub: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
});
