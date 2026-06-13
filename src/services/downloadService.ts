/**
 * downloadService — packages route corridor tiles for offline use.
 *
 * Pipeline (per route):
 * 1. Resolve polyline from routing engine (Mapbox / Valhalla / OSRM).
 * 2. Compute corridor polygon = buffer(polyline, corridorRadiusM).
 * 3. Query the tile set that intersects the corridor at zooms 11..15.
 * 4. Download MVT/raster tiles into expo-file-system, write manifest.json.
 * 5. Persist maneuvers + metadata; mark RoutePackage.status = 'ready'.
 *
 * The mock emits progress events so the UI can be exercised end-to-end.
 */
export type ProgressFn = (p: number) => void;

export const downloadService = {
  async downloadRoute(routeId: string, onProgress: ProgressFn): Promise<void> {
    for (let i = 0; i <= 100; i += 4) {
      await new Promise((r) => setTimeout(r, 90));
      onProgress(i / 100);
    }
    // eslint-disable-next-line no-console
    console.log('[download] complete', routeId);
  },
};
