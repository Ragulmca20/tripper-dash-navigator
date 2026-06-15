import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { LatLng } from 'react-native-maps';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import BaseMap from '@/components/map/BaseMap';
import RoutePolyline from '@/components/map/RoutePolyline';
import { colors } from '@/theme';
import { useRoutesStore } from '@/store/routesStore';
import { bufferCorridor } from '@/services/corridor';

type ParamList = { RoutePreview: { routeId: string } };

export default function RoutePreviewScreen() {
  const nav = useNavigation<any>();
  const { params } = useRoute<RouteProp<ParamList, 'RoutePreview'>>();
  const mapRef = useRef<MapView | null>(null);
  const route = useRoutesStore((s) => s.routes.find((r) => r.id === params.routeId));
  const polyline = useMemo<import('react-native-maps').LatLng[]>(() => route?.polyline ?? [], [route]);
  const corridor = useMemo(() => bufferCorridor(polyline, 5), [polyline]); // 5 km

  useEffect(() => {
    if (mapRef.current && polyline.length > 1) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(polyline, {
          edgePadding: { top: 80, bottom: 280, left: 60, right: 60 },
          animated: true,
        });
      }, 400);
    }
  }, [polyline]);

  if (!route) return null;

  return (
    <View style={styles.container}>
      <BaseMap ref={mapRef}>
        <RoutePolyline coordinates={polyline} corridor={corridor} />
      </BaseMap>

      <TouchableOpacity style={styles.back} onPress={() => nav.goBack()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <View style={styles.sheet}>
        <Text style={styles.title}>{`${route.from.name} → ${route.to.name}`}</Text>
        <Text style={styles.subtitle}>
          {route.distanceKm.toFixed(1)} km • {Math.round(route.durationMin)} min
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          <Chip label={`Corridor ${route.corridorRadiusM / 1000} km`} />
          <Chip label={`${route.maneuvers.length} maneuvers`} />
          <Chip label={`Package ${Math.round(route.sizeBytes / 1e6)} MB`} />
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.btnGhost]}
            onPress={() => nav.navigate('RoutePlanner')}
          >
            <Text style={styles.btnGhostText}>Edit waypoints</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={() => {
              nav.navigate('MapLibreNavigation', { routeId: route.id });
            }}
          >
            <Text style={styles.btnPrimaryText}>
              {route.status === 'ready' ? 'Start navigation' : 'View route'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const Chip = ({ label }: { label: string }) => (
  <View style={styles.chip}><Text style={styles.chipText}>{label}</Text></View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  back: {
    position: 'absolute', top: 50, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(10,10,11,0.85)',
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { color: colors.textPrimary, fontSize: 22 },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: '#111114',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 32,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '800' },
  subtitle: { color: colors.textSecondary, marginTop: 4 },
  chip: {
    backgroundColor: 'rgba(255,180,0,0.12)',
    borderColor: 'rgba(255,180,0,0.35)',
    borderWidth: 1, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 6, marginRight: 8,
  },
  chipText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', marginTop: 20, gap: 12 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  btnGhost: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  btnGhostText: { color: colors.textPrimary, fontWeight: '700' },
  btnPrimary: { backgroundColor: colors.accent },
  btnPrimaryText: { color: '#0A0A0B', fontWeight: '800' },
});
