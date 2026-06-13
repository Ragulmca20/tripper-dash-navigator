import React from 'react';
import { Polyline, Polygon, Marker, LatLng } from 'react-native-maps';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '@/theme';

type Props = {
  coordinates: LatLng[];
  /** Optional buffered corridor polygon (for offline download preview). */
  corridor?: LatLng[];
  showEndpoints?: boolean;
  remainingFromIndex?: number;
};

export default function RoutePolyline({
  coordinates,
  corridor,
  showEndpoints = true,
  remainingFromIndex = 0,
}: Props) {
  if (!coordinates.length) return null;

  const traveled = coordinates.slice(0, Math.max(1, remainingFromIndex + 1));
  const remaining = coordinates.slice(remainingFromIndex);

  return (
    <>
      {corridor && corridor.length >= 3 && (
        <Polygon
          coordinates={corridor}
          fillColor="rgba(255, 180, 0, 0.10)"
          strokeColor="rgba(255, 180, 0, 0.45)"
          strokeWidth={1}
        />
      )}

      {remainingFromIndex > 0 && (
        <Polyline
          coordinates={traveled}
          strokeColor="rgba(142,142,147,0.55)"
          strokeWidth={5}
          lineCap="round"
          lineJoin="round"
        />
      )}

      <Polyline
        coordinates={remaining}
        strokeColor={colors.accent}
        strokeWidth={7}
        lineCap="round"
        lineJoin="round"
        zIndex={2}
      />

      {showEndpoints && (
        <>
          <Marker coordinate={coordinates[0]} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={[styles.endpoint, styles.start]}>
              <Text style={styles.endpointText}>A</Text>
            </View>
          </Marker>
          <Marker
            coordinate={coordinates[coordinates.length - 1]}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[styles.endpoint, styles.end]}>
              <Text style={styles.endpointText}>B</Text>
            </View>
          </Marker>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  endpoint: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0A0A0B',
  },
  start: { backgroundColor: '#34C759' },
  end: { backgroundColor: '#FF3B30' },
  endpointText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
});
