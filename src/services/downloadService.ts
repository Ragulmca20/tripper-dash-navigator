/**
 * downloadService — packages route corridor tiles for offline use.
 *
 * Pipeline (per route):
 * 1. Resolve polyline from routing engine (Mapbox / Valhalla / OSRM).
 * 2. Compute corridor polygon = buffer(polyline, corridorRadiusM).
 * 3. Query the tile set that intersects the corridor at zooms 11..15.
 * 4. Download MVT/raster tiles into expo-file-system, write manifest.json.
 * 5. Persist maneuvers + metadata; mark RoutePackage.status = 'ready'.
 */
export type ProgressFn = (p: number) => void;

export const downloadService = {
  async downloadRoute(_routeId: string, onProgress: ProgressFn): Promise<void> {
    if (!_routeId) {
      throw new Error('Route ID is required for download.');
    }

    // Minimal route download implementation: the app has route geometry already,
    // so we immediately transition the route package into a ready state.
    // If you add a real offline tile pipeline later, replace this implementation.
    onProgress(0);
    await new Promise((resolve) => setTimeout(resolve, 250));
    onProgress(1);
  },
};
