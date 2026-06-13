/**
 * gpsService — wraps expo-location with a normalised stream.
 * Production: switch to background-location task for screen-off navigation.
 */
import * as Location from 'expo-location';
import type { LatLng } from '@/types';

export type GpsFix = { coord: LatLng; headingDeg?: number; speedKmh?: number; accuracyM?: number };

export const gpsService = {
  async requestPermission() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  },
  async watch(onFix: (f: GpsFix) => void) {
    return Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 5, timeInterval: 1000 },
      (loc) =>
        onFix({
          coord: { lat: loc.coords.latitude, lng: loc.coords.longitude },
          headingDeg: loc.coords.heading ?? undefined,
          speedKmh: loc.coords.speed != null ? loc.coords.speed * 3.6 : undefined,
          accuracyM: loc.coords.accuracy ?? undefined,
        }),
    );
  },
};
