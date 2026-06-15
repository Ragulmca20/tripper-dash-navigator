/**
 * DashView — 526x300 cluster view for the Royal Enfield Tripper Dash.
 *
 * PATCHED: the mini-map column now renders a real MapView. We keep gestures
 * disabled (lite-mode behaviour) because this surface is mirrored to the
 * cluster and the rider should not interact with it directly.
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { LatLng } from 'react-native-maps';
import BaseMap from '@/components/map/BaseMap';
import RoutePolyline from '@/components/map/RoutePolyline';
import UserPuck from '@/components/map/UserPuck';
import { colors } from '@/theme';
import { useNavStore } from '@/store/navStore';

export const DASH_W = 526;
export const DASH_H = 300;

interface DashViewProps {
  polyline?: LatLng[];
  etaMin?: number;
  remainingKm?: number;
  speedKmh?: number;
  nextManeuverM?: number;
  nextManeuverLabel?: string;
  headingDeg?: number;
}

export default function DashView({
  polyline = [] as LatLng[],
  etaMin,
  remainingKm,
  speedKmh,
  nextManeuverM,
  nextManeuverLabel,
  headingDeg,
}: DashViewProps) {
  const mapRef = useRef<MapView | null>(null);
  const session = useNavStore((s) => s.session);
  const coords: LatLng | undefined = (session as any)?.coords;
  const heading: number = headingDeg ?? (session as any)?.heading ?? 0;
  const speed = speedKmh ?? (session as any)?.speedKmh ?? 0;
  const etaMinutes: number = etaMin ?? session?.etaMin ?? 0;
  const remainingDistanceKm: number = remainingKm ?? session?.remainingKm ?? 0;
  const nextManeuverFromSession: { glyph?: string; distanceM?: number; instruction?: string } | undefined =
    (session as any)?.nextManeuver;
  const nextManeuver = nextManeuverFromSession ?? {
    glyph: '↑',
    distanceM: nextManeuverM ?? 0,
    instruction: nextManeuverLabel ?? 'Continue',
  };

  useEffect(() => {
    if (mapRef.current && coords) {
      mapRef.current.animateCamera(
        { center: coords, heading, pitch: 30, zoom: 16 },
        { duration: 500 },
      );
    }
  }, [coords, heading]);

  return (
    <View style={styles.cluster}>
      {/* LEFT: maneuver */}
      <View style={[styles.col, styles.colLeft]}>
        <View style={styles.glyphBox}>
          <Text style={styles.glyph}>{nextManeuver?.glyph ?? '↑'}</Text>
        </View>
        <Text style={styles.distance}>{nextManeuver?.distanceM ?? 0}<Text style={styles.unit}>m</Text></Text>
        <Text style={styles.street} numberOfLines={2}>
          {nextManeuver?.instruction ?? 'Continue'}
        </Text>
      </View>

      {/* CENTER: real mini-map */}
      <View style={styles.colMap}>
        <BaseMap
          ref={mapRef}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          showsUserLocation={false}
        >
          {polyline.length > 0 && (
            <RoutePolyline coordinates={polyline} showEndpoints={false} />
          )}
          {coords && <UserPuck coordinate={coords} heading={heading} />}
        </BaseMap>
      </View>

      {/* RIGHT: HUD */}
      <View style={[styles.col, styles.colRight]}>
        <HudStat label="ETA" value={`${etaMinutes}`} unit="min" />
        <HudStat label="LEFT" value={`${remainingDistanceKm.toFixed(1)}`} unit="km" />
        <HudStat label="SPD" value={`${Math.round(speed)}`} unit="km/h" big />
      </View>
    </View>
  );
}

const HudStat = ({ label, value, unit, big }: any) => (
  <View style={styles.hudStat}>
    <Text style={styles.hudLabel}>{label}</Text>
    <Text style={[styles.hudValue, big && styles.hudValueBig]}>
      {value} <Text style={styles.hudUnit}>{unit}</Text>
    </Text>
  </View>
);

const styles = StyleSheet.create({
  cluster: {
    width: DASH_W, height: DASH_H,
    backgroundColor: '#000', flexDirection: 'row',
    borderRadius: 12, overflow: 'hidden',
  },
  col: { padding: 14, justifyContent: 'space-between' },
  colLeft: { width: 170, borderRightWidth: 1, borderColor: '#1c1c1e' },
  colRight: { width: 156, borderLeftWidth: 1, borderColor: '#1c1c1e' },
  colMap: { flex: 1 },
  glyphBox: {
    width: 96, height: 96, borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  glyph: { fontSize: 56, color: '#000', fontWeight: '900' },
  distance: { color: colors.accent, fontSize: 36, fontWeight: '900' },
  unit: { fontSize: 16, color: colors.textSecondary },
  street: { color: '#fff', fontSize: 13, fontWeight: '600' },
  hudStat: {},
  hudLabel: { color: colors.textSecondary, fontSize: 11, letterSpacing: 1.2, fontWeight: '700' },
  hudValue: { color: '#fff', fontSize: 22, fontWeight: '800' },
  hudValueBig: { fontSize: 40 },
  hudUnit: { color: colors.textSecondary, fontSize: 12 },
});
