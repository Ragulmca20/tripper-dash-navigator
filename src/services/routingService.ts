import { LatLng } from '../types';

type RouteResult = {
  coords: LatLng[];
  distance?: number;
  duration?: number;
};

async function fetchJson(url: string) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

// decode polyline (precision 5 by default)
function decodePolyline(str: string, precision = 5): LatLng[] {
  let index = 0;
  const coordinates: LatLng[] = [];
  let lat = 0;
  let lon = 0;

  const factor = Math.pow(10, precision);

  while (index < str.length) {
    let result = 1;
    let shift = 0;
    let b: number;
    do {
      b = str.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lat += (result & 1) ? ~(result >> 1) : result >> 1;

    result = 1;
    shift = 0;
    do {
      b = str.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lon += (result & 1) ? ~(result >> 1) : result >> 1;

    coordinates.push({ latitude: lat / factor, longitude: lon / factor });
  }
  return coordinates;
}

export async function getRouteOSRM(
  start: LatLng,
  end: LatLng
): Promise<RouteResult> {
  const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=polyline`;
  const data = await fetchJson(url);
  if (!data || data.code !== 'Ok' || !data.routes || !data.routes.length) {
    throw new Error(`Routing error: ${data && data.message ? data.message : 'no route'}`);
  }
  const r = data.routes[0];
  const coords = decodePolyline(r.geometry, 5);
  return { coords, distance: r.distance, duration: r.duration };
}

export default { getRouteOSRM };
