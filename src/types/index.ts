/** Domain types shared across features. */

export type LatLng = { lat: number; lng: number };

export type Place = {
  id: string;
  name: string;
  subtitle?: string;
  coord: LatLng;
};

export type Maneuver = {
  id: string;
  at: LatLng;
  type: 'left' | 'right' | 'slight-left' | 'slight-right' | 'straight' | 'uturn' | 'arrive';
  instruction: string;
  distanceM: number;   // distance from previous maneuver
};

export type RoutePackage = {
  id: string;
  from: Place;
  to: Place;
  distanceKm: number;
  durationMin: number;
  /** Encoded polyline string or array of coords. */
  polyline: LatLng[];
  maneuvers: Maneuver[];
  /** Corridor half-width in metres around the polyline. Default 2000m. */
  corridorRadiusM: number;
  /** On-disk size estimate in bytes (tiles + metadata). */
  sizeBytes: number;
  downloadedAt: number; // epoch ms
  status: 'queued' | 'downloading' | 'ready' | 'stale' | 'error';
  progress?: number;    // 0..1, only while downloading
};

export type DashStatus = 'disconnected' | 'discovering' | 'connecting' | 'connected' | 'error';
export type GpsStatus = 'unavailable' | 'searching' | 'weak' | 'locked';
export type NetStatus = 'offline' | 'online';

export type NavSession = {
  routeId: string;
  startedAt: number;
  paused: boolean;
  /** Progress along route 0..1 */
  progress: number;
  position?: LatLng;
  headingDeg?: number;
  speedKmh?: number;
  etaMin: number;
  remainingKm: number;
};
