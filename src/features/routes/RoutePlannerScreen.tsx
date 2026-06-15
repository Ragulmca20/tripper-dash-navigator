import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
} from 'react-native';
import MapView, { LatLng, LongPressEvent, MapPressEvent, Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import BaseMap from '@/components/map/BaseMap';
import RoutePolyline from '@/components/map/RoutePolyline';
import { colors } from '@/theme';
import { computeRoute } from '@/services/routing';

type Mode = 'start' | 'end' | 'via';

export default function RoutePlannerScreen() {
  const nav = useNavigation<any>();
  const mapRef = useRef<MapView | null>(null);
  const [mode, setMode] = useState<Mode>('start');
  const [start, setStart] = useState<LatLng | null>(null);
  const [end, setEnd] = useState<LatLng | null>(null);
  const [via, setVia] = useState<LatLng[]>([]);
  const [polyline, setPolyline] = useState<LatLng[]>([]);
  const [loading, setLoading] = useState(false);

  const onPress = (e: MapPressEvent) => {
    const c = e.nativeEvent.coordinate;
    if (mode === 'start') setStart(c);
    else if (mode === 'end') setEnd(c);
    else setVia((v) => [...v, c]);
  };

  const onLongPress = (e: LongPressEvent) =>
    setVia((v) => [...v, e.nativeEvent.coordinate]);

  const calculate = async () => {
    if (!start || !end) return;
    setLoading(true);
    try {
      const res = await computeRoute({ start, end, via });
      setPolyline(res.polyline);
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(res.polyline, {
          edgePadding: { top: 80, bottom: 320, left: 60, right: 60 },
          animated: true,
        });
      }, 200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BaseMap ref={mapRef} onPress={onPress} onLongPress={onLongPress}>
        {start && (
          <Marker coordinate={start} pinColor="#34C759" title="Start" />
        )}
        {end && <Marker coordinate={end} pinColor="#FF3B30" title="End" />}
        {via.map((v, i) => (
          <Marker key={i} coordinate={v} pinColor={colors.accent} title={`Via ${i + 1}`} />
        ))}
        {polyline.length > 0 && (
          <RoutePolyline coordinates={polyline} showEndpoints={false} />
        )}
      </BaseMap>

      <View style={styles.modeBar}>
        {(['start', 'end', 'via'] as Mode[]).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeChip, mode === m && styles.modeChipActive]}
            onPress={() => setMode(m)}
          >
            <Text style={[styles.modeText, mode === m && styles.modeTextActive]}>
              {m === 'start' ? 'Set Start' : m === 'end' ? 'Set End' : 'Add Via'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>Waypoints</Text>
        <FlatList
          data={[
            ...(start ? [{ key: 'A', label: 'Start', c: start }] : []),
            ...via.map((c, i) => ({ key: `V${i}`, label: `Via ${i + 1}`, c })),
            ...(end ? [{ key: 'B', label: 'End', c: end }] : []),
          ]}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.wpChip}>
              <Text style={styles.wpLabel}>{item.label}</Text>
              <Text style={styles.wpCoord}>
                {item.c.latitude.toFixed(3)}, {item.c.longitude.toFixed(3)}
              </Text>
            </View>
          )}
        />

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.btnGhost]}
            onPress={() => { setStart(null); setEnd(null); setVia([]); setPolyline([]); }}
          >
            <Text style={styles.btnGhostText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary, (!start || !end) && { opacity: 0.4 }]}
            disabled={!start || !end || loading}
            onPress={calculate}
          >
            <Text style={styles.btnPrimaryText}>
              {loading ? 'Computing…' : polyline.length ? 'Recalculate' : 'Compute route'}
            </Text>
          </TouchableOpacity>
        </View>

        {polyline.length > 0 && (
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary, { marginTop: 10 }]}
            onPress={() => nav.navigate('RoutePreview', { routeId: 'draft' })}
          >
            <Text style={styles.btnPrimaryText}>Save & preview download</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.back} onPress={() => nav.goBack()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  back: {
    position: 'absolute', top: 50, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(10,10,11,0.85)',
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { color: colors.textPrimary, fontSize: 22 },
  modeBar: {
    position: 'absolute', top: 50, right: 16,
    flexDirection: 'row', gap: 6,
    backgroundColor: 'rgba(10,10,11,0.85)',
    padding: 4, borderRadius: 22,
  },
  modeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18 },
  modeChipActive: { backgroundColor: colors.accent },
  modeText: { color: colors.textSecondary, fontWeight: '700', fontSize: 12 },
  modeTextActive: { color: '#0A0A0B' },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: '#111114',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 32,
  },
  sheetTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: 10 },
  wpChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12, padding: 10, marginRight: 8, minWidth: 110,
  },
  wpLabel: { color: colors.accent, fontWeight: '800', fontSize: 12 },
  wpCoord: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  actions: { flexDirection: 'row', marginTop: 16, gap: 12 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  btnGhost: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  btnGhostText: { color: colors.textPrimary, fontWeight: '700' },
  btnPrimary: { backgroundColor: colors.accent },
  btnPrimaryText: { color: '#0A0A0B', fontWeight: '800' },
});
