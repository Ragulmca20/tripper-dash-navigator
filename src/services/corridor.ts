import { LatLng } from 'react-native-maps';

/**
 * Quick-and-dirty equirectangular corridor buffer used for the
 * "tiles you will download" preview polygon. Replace with turf.js
 * buffer when you wire real offline downloading.
 *
 * @param km Buffer radius in kilometers.
 */
export function bufferCorridor(line: LatLng[], km = 5): LatLng[] {
  if (line.length < 2) return [];
  const dLat = km / 111;
  const right: LatLng[] = [];
  const left: LatLng[] = [];

  for (let i = 0; i < line.length; i++) {
    const prev = line[i - 1] ?? line[i];
    const next = line[i + 1] ?? line[i];
    const dx = next.longitude - prev.longitude;
    const dy = next.latitude - prev.latitude;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const dLng = km / (111 * Math.cos((line[i].latitude * Math.PI) / 180));
    right.push({
      latitude: line[i].latitude + ny * dLat,
      longitude: line[i].longitude + nx * dLng,
    });
    left.push({
      latitude: line[i].latitude - ny * dLat,
      longitude: line[i].longitude - nx * dLng,
    });
  }
  return [...right, ...left.reverse()];
}
