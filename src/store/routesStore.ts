import { create } from 'zustand';
import type { RoutePackage, Place } from '@/types';

type RoutesState = {
  routes: RoutePackage[];
  recent: Place[];
  favorites: Place[];
  addRoute: (r: RoutePackage) => void;
  removeRoute: (id: string) => void;
  updateRoute: (id: string, patch: Partial<RoutePackage>) => void;
  getRoute: (id: string) => RoutePackage | undefined;
  addRecent: (p: Place) => void;
  toggleFavorite: (p: Place) => void;
};

function polylineHash(polyline: import('@/types').MapLatLng[]) {
  try {
    return JSON.stringify(
      polyline.map((p) => {
        const lat = (p as any).latitude ?? (p as any).lat ?? 0;
        const lng = (p as any).longitude ?? (p as any).lng ?? 0;
        return [lat, lng];
      }),
    );
  } catch {
    return '';
  }
}

export const useRoutesStore = create<RoutesState>((set, get) => ({
  routes: [],
  recent: [],
  favorites: [],
  addRoute: (r) =>
    set((s) => {
      // Prevent caching duplicate routes: if a route exists with the same
      // polyline hash we update it instead of inserting a new entry.
      const incomingHash = polylineHash(r.polyline as any);
      const existingIdx = s.routes.findIndex((x) => polylineHash(x.polyline as any) === incomingHash);
      if (existingIdx >= 0) {
        const updated = [...s.routes];
        updated[existingIdx] = { ...updated[existingIdx], ...r };
        // Move updated route to the front (most recent)
        const found = updated.splice(existingIdx, 1)[0];
        return { routes: [found, ...updated] };
      }
      // Otherwise insert and ensure no duplicate ids remain
      return { routes: [r, ...s.routes.filter((x) => x.id !== r.id)] };
    }),
  removeRoute: (id) => set((s) => ({ routes: s.routes.filter((r) => r.id !== id) })),
  updateRoute: (id, patch) =>
    set((s) => ({ routes: s.routes.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
  getRoute: (id) => get().routes.find((r) => r.id === id),
  addRecent: (p) =>
    set((s) => ({ recent: [p, ...s.recent.filter((x) => x.id !== p.id)].slice(0, 8) })),
  toggleFavorite: (p) =>
    set((s) => ({
      favorites: s.favorites.some((x) => x.id === p.id)
        ? s.favorites.filter((x) => x.id !== p.id)
        : [p, ...s.favorites],
    })),
}));
