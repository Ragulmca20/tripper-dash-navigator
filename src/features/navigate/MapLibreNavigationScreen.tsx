import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import * as Location from 'expo-location';
import { Map, Camera, UserLocation, GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';
import { getRouteOSRM } from '../../services/routingService';
import { LatLng } from '../../types';

export default function MapLibreNavigationScreen() {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [route, setRoute] = useState<LatLng[] | null>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();
  }, []);

  async function startRoute() {
    if (!location) return;
    // example destination: small offset north-east (for demo)
    const dest: LatLng = { latitude: location.latitude + 0.02, longitude: location.longitude + 0.02 };
    try {
      const r = await getRouteOSRM(location, dest);
      setRoute(r.coords);
      // move camera to fit
      if (cameraRef.current && r.coords.length) cameraRef.current.setCamera({ centerCoordinate: [r.coords[0].longitude, r.coords[0].latitude], zoom: 14 });
    } catch (e) {
      console.warn('Routing failed', e);
    }
  }

  return (
    <View style={styles.container}>
      <Map style={styles.map} mapStyle="https://demotiles.maplibre.org/style.json">
        <Camera
          ref={cameraRef}
          initialViewState={
            location
              ? { center: [location.longitude, location.latitude], zoom: 13 }
              : undefined
          }
        />
        <UserLocation />
        {route && (
          <GeoJSONSource
            id="routeSource"
            data={{ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: route.map(r => [r.longitude, r.latitude]) } }] }}
          >
            <Layer
              id="routeLine"
              type="line"
              source="routeSource"
              style={{ lineColor: '#007aff', lineWidth: 4 }}
            />
          </GeoJSONSource>
        )}
      </Map>
      <View style={styles.controls}>
        <Text>MapLibre Navigation Prototype</Text>
        <Button title="Route to nearby" onPress={startRoute} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  controls: { position: 'absolute', top: 16, left: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 8 },
});
