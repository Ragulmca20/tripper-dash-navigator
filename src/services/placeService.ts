import { MapLatLng, Place } from '@/types';
const API_KEY = 'AIzaSyBqFmB22UEFE6BZB6OT7FjBg2Au9bQCEN8';
const API_KEY_SOURCE = 'hardcoded';
// eslint-disable-next-line no-console
console.debug(`placeService: Google Maps API key source=${API_KEY_SOURCE}`);

type AutocompletePrediction = { description: string; place_id: string; structured_formatting?: any };

type GoogleResponse = { status: string; error_message?: string } & Record<string, any>;

function assertApiKey() {
  if (!API_KEY) {
    throw new Error('Google Maps API key not configured. Set extra.googleMapsApiKey in app.json or GOOGLE_MAPS_API_KEY.');
  }
}

function validateGoogleResponse(json: GoogleResponse, service: string) {
  if (json.status === 'OK') return;
  if (service === 'Places autocomplete' && json.status === 'ZERO_RESULTS') return;
  throw new Error(json.error_message ?? `${service} API error: ${json.status}`);
}

export const placeService = {
  async autocomplete(input: string): Promise<AutocompletePrediction[]> {
    assertApiKey();
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input,
    )}&key=${API_KEY}&types=geocode&components=country:in`;
    const res = await fetch(url);
    const json = (await res.json()) as GoogleResponse;
    validateGoogleResponse(json, 'Places autocomplete');
    return (json.predictions || []) as AutocompletePrediction[];
  },

  async getPlaceDetails(placeId: string) {
    assertApiKey();
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId,
    )}&key=${API_KEY}&fields=name,geometry,formatted_address`;
    const res = await fetch(url);
    const json = (await res.json()) as GoogleResponse;
    validateGoogleResponse(json, 'Place details');
    const loc = json.result?.geometry?.location;
    if (!loc) {
      throw new Error('Place details response is missing geometry');
    }
    return {
      id: placeId,
      name: json.result?.name ?? json.result?.formatted_address ?? 'Unknown',
      subtitle: json.result?.formatted_address,
      coord: { latitude: loc.lat ?? 0, longitude: loc.lng ?? 0 },
    } as Place;
  },

  async directions(from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }) {
    assertApiKey();
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${from.latitude},${from.longitude}&destination=${to.latitude},${to.longitude}&key=${API_KEY}&mode=driving`;
    const res = await fetch(url);
    const json = (await res.json()) as GoogleResponse;
    if (!json || typeof json.status !== 'string') {
      throw new Error('Directions API returned an unexpected response');
    }
    if (json.status !== 'OK') {
      throw new Error(json.error_message ?? `Directions API error: ${json.status}`);
    }
    const route = json.routes?.[0];
    if (!route) {
      throw new Error('Directions response contained no route');
    }
    const leg = route.legs?.[0];
    const overview_polyline = route.overview_polyline?.points ?? '';

    function decodePolyline(encoded: string): MapLatLng[] {
      if (!encoded) return [];
      let index = 0, lat = 0, lng = 0, shift = 0, result = 0;
      const coordinates: MapLatLng[] = [];
      const len = encoded.length;
      while (index < len) {
        let b: number;
        shift = 0;
        result = 0;
        do {
          b = encoded.charCodeAt(index++) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (b >= 0x20);
        const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
        lat += dlat;

        shift = 0;
        result = 0;
        do {
          b = encoded.charCodeAt(index++) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (b >= 0x20);
        const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
        lng += dlng;

        coordinates.push({ latitude: lat / 1e5, longitude: lng / 1e5 } as unknown as MapLatLng);
      }
      return coordinates;
    }

    const polyline = decodePolyline(overview_polyline);
    return {
      polyline,
      distanceMeters: leg?.distance?.value ?? 0,
      durationSec: leg?.duration?.value ?? 0,
    };
  },
};

export default placeService;
