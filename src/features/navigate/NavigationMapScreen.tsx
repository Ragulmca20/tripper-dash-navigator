import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MapView, { LatLng } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import BaseMap from '@/components/map/BaseMap';
import RoutePolyline from '@/components/map/RoutePolyline';
import UserPuck from '@/components/map/UserPuck';
import { colors } from '@/theme';
import { useNavStore } from '@/store/navStore';
import { useRoutesStore } from '@/store/routesStore';

type ParamList = { NavigationMap: { routeId: string } };

export default function NavigationMapScreen() {
  const nav = useNavigation();
  const { params } = useRoute<RouteProp<ParamList, 'NavigationMap'>>();
  const mapRef = useRef<MapView | null>(null);

  const route = useRoutesStore((s) => s.routes.find((r) => r.id === params.routeId));
  const { speedKmh, etaMinutes, remainingKm, nextManeuver, start, stop, setLocation } =
    useNavStore();

  const [coords, setCoords] = useState<LatLng | null>(null);
  const [heading, setHeading] = useState(0);
  const [follow, setFollow] = useState(true);
  const [permError, setPermError] = useState<string | null>(null);

  // Decode route polyline (assumes route.polyline is LatLng[])
  const polyline: LatLng[] = useMemo(() => route?.polyline ?? [], [route]);
  const remainingIndex = useNavStore((s) => s.remainingIndex);

  useEffect(() => {
    let locSub: Location.LocationSubscription | null = null;
    let headSub: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermError('Location permission denied');
        return;
      }
      start(params.routeId);

      locSub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 2,
        },
        (loc) => {
          const c = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setCoords(c);
          setLocation(c, loc.coords.speed ?? 0);
          if (follow && mapRef.current) {
            mapRef.current.animateCamera(
              {
                center: c,
                pitch: 55,
                heading: loc.coords.heading ?? heading,
                zoom: 17,
              },
              { duration: 800 },
            );
          }
        },
      );

      headSub = await Location.watchHeadingAsync((h) => {
        setHeading(h.trueHeading ?? h.magHeading);
      });
    })();

    return () => {
      locSub?.remove();
      headSub?.remove();
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.routeId]);

  const recenter = () => {
    setFollow(true);
    if (coords && mapRef.current) {
      mapRef.current.animateCamera(
        { center: coords, pitch: 55, heading, zoom: 17 },
        { duration: 600 },
      );
    }
  };

  if (!route) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Route not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BaseMap
        ref={mapRef}
        offlineMode={route.downloaded}
        onPanDrag={() => setFollow(false)}
        initialRegion={{
          latitude: polyline[0]?.latitude ?? 12.9716,
          longitude: polyline[0]?.longitude ?? 77.5946,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <RoutePolyline coordinates={polyline} remainingFromIndex={remainingIndex} />
        {coords && <UserPuck coordinate={coords} heading={heading} />}
      </BaseMap>

      {/* Next maneuver banner */}
      <View style={styles.maneuverBanner}>
        <View style={styles.maneuverIcon}>
          <Text style={styles.maneuverGlyph}>{nextManeuver?.glyph ?? '↑'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.maneuverDistance}>
            {nextManeuver?.distanceM ?? 0} m
          </Text>
          <Text style={styles.maneuverInstruction} numberOfLines={2}>
            {nextManeuver?.instruction ?? 'Continue straight'}
          </Text>
        </View>
      </View>

      {/* HUD */}
      <View style={styles.hud}>
        <Stat label="SPEED" value={`${Math.round(speedKmh)}`} unit="km/h" />
        <Stat label="ETA" value={`${etaMinutes}`} unit="min" />
        <Stat label="LEFT" value={`${remainingKm.toFixed(1)}`} unit="km" />
      </View>

      {!follow && (
        <TouchableOpacity style={styles.recenterFab} onPress={recenter}>
          <Text style={styles.recenterText}>◎ Recenter</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.exit} onPress={() => nav.goBack()}>
        <Text style={styles.exitText}>End</Text>
      </TouchableOpacity>

      {permError && (
        <View style={styles.permBanner}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.permText}>{permError}</Text>
        </View>
      )}
    </View>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>
        {value} <Text style={styles.statUnit}>{unit}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  fallbackText: { color: colors.textPrimary, fontSize: 16 },
  maneuverBanner: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(10,10,11,0.92)',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,180,0,0.35)',
  },
  maneuverIcon: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  maneuverGlyph: { fontSize: 30, color: '#0A0A0B', fontWeight: '900' },
  maneuverDistance: { color: colors.accent, fontSize: 22, fontWeight: '800' },
  maneuverInstruction: { color: colors.textPrimary, fontSize: 14, marginTop: 2 },
  hud: {
    position: 'absolute', bottom: 28, left: 16, right: 16,
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: 'rgba(10,10,11,0.92)', borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  stat: { alignItems: 'center', flex: 1 },
  statLabel: { color: colors.textSecondary, fontSize: 11, letterSpacing: 1.2, fontWeight: '700' },
  statValue: { color: colors.textPrimary, fontSize: 28, fontWeight: '800', marginTop: 2 },
  statUnit: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  recenterFab: {
    position: 'absolute', right: 16, bottom: 140,
    backgroundColor: colors.accent, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 22,
  },
  recenterText: { color: '#0A0A0B', fontWeight: '800' },
  exit: {
    position: 'absolute', left: 16, bottom: 140,
    backgroundColor: 'rgba(255,59,48,0.95)', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 22,
  },
  exitText: { color: '#fff', fontWeight: '800' },
  permBanner: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: 'rgba(255,59,48,0.95)', padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  permText: { color: '#fff', fontWeight: '700' },
});
