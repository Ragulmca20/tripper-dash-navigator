import { LatLng } from 'react-native-maps';

/**
 * STUB routing service. Replace with a real call to GraphHopper, OSRM,
 * Mapbox Directions, or your own backend.
 *
 * The current implementation returns a straight-line polyline sampled
 * between start -> via[] -> end so the UI is fully exercised.
 */
export async function computeRoute(opts: {
  start: LatLng;
  end: LatLng;
  via?: LatLng[];
}): Promise<{ polyline: LatLng[]; distanceKm: number; durationMin: number }> {
  const points = [opts.start, ...(opts.via ?? []), opts.end];
  const polyline: LatLng[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    for (let t = 0; t <= 1; t += 0.02) {
      polyline.push({
        latitude: a.latitude + (b.latitude - a.latitude) * t,
        longitude: a.longitude + (b.longitude - a.longitude) * t,
      });
    }
  }
  const distanceKm = haversineKm(points);
  return {
    polyline,
    distanceKm,
    durationMin: Math.round((distanceKm / 45) * 60),
  };
}

function haversineKm(points: LatLng[]) {
  const R = 6371;
  let d = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
    const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
    const s =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((a.latitude * Math.PI) / 180) *
        Math.cos((b.latitude * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    d += 2 * R * Math.asin(Math.sqrt(s));
  }
  return d;
}
