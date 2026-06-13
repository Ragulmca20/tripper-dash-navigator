import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing, typography } from '@/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '@/components/SearchBar';
import { Icon } from '@/components/TabIcon';
import { useRoutesStore } from '@/store/routesStore';
import type { Place } from '@/types';
import type { RootStackParams } from '@/navigation/RootNavigator';

const SUGGESTIONS: Place[] = [
  { id: 's1', name: 'Yelagiri Hills', subtitle: '230 km · 4h 20m', coord: { lat: 12.58, lng: 78.64 } },
  { id: 's2', name: 'Chikmagalur', subtitle: '245 km · 5h 10m', coord: { lat: 13.31, lng: 75.77 } },
  { id: 's3', name: 'Ooty', subtitle: '270 km · 6h 00m', coord: { lat: 11.41, lng: 76.69 } },
];

export const SearchScreen: React.FC = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const [q, setQ] = useState('');
  const { recent, favorites, addRecent } = useRoutesStore();

  const results = useMemo(
    () => (q.length < 1 ? [] : SUGGESTIONS.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()))),
    [q],
  );

  const openRoute = (p: Place) => {
    addRecent(p);
    // Route discovery would happen here; for the prototype we open a sample route detail.
    nav.navigate('RouteDetail', { routeId: 'r1' });
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

            <Section title="Suggested rides">
              {SUGGESTIONS.map((s) => (
                <PlaceRow key={s.id} place={s} onPress={() => openRoute(s)} amber />
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
