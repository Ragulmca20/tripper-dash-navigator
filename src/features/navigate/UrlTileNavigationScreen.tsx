import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import MapView, { UrlTile, Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { getRouteOSRM } from '../../services/routingService';
import { LatLng } from '../../types';

export default function UrlTileNavigationScreen() {
  const [loc, setLoc] = useState<LatLng | null>(null);
  const [route, setRoute] = useState<LatLng[] | null>(null);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const l = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLoc({ latitude: l.coords.latitude, longitude: l.coords.longitude });
    })();
  }, []);

  async function startRoute() {
    if (!loc) return;
    const dest: LatLng = { latitude: loc.latitude + 0.02, longitude: loc.longitude + 0.02 };
    try {
      const r = await getRouteOSRM(loc, dest);
      setRoute(r.coords);
      if (r.coords && r.coords.length && mapRef.current) {
        const first = r.coords[0];
        mapRef.current.animateToRegion({ latitude: first.latitude, longitude: first.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 500);
      }
    } catch (e) {
      console.warn('OSRM route error', e);
    }
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={r => (mapRef.current = r)}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={loc ? { latitude: loc.latitude, longitude: loc.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 } : undefined}
      >
        <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} flipY={false} />
        {loc && <Marker coordinate={{ latitude: loc.latitude, longitude: loc.longitude }} />}
        {route && <Polyline coordinates={route.map(r => ({ latitude: r.latitude, longitude: r.longitude }))} strokeWidth={4} strokeColor="#007aff" />}
      </MapView>
      <View style={styles.controls}>
        <Text style={styles.title}>UrlTile + OSRM Prototype</Text>
        <Button title="Route to nearby" onPress={startRoute} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  controls: { position: 'absolute', top: 16, left: 16, right: 16, backgroundColor: 'white', padding: 8, borderRadius: 8 },
  title: { marginBottom: 8, fontWeight: '600' },
});
