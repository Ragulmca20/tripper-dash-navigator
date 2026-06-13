import { create } from 'zustand';
import type { RoutePackage, Place } from '@/types';

const sample = (id: string, fromName: string, toName: string, km: number, min: number): RoutePackage => ({
  id,
  from: { id: `${id}-f`, name: fromName, coord: { lat: 12.97, lng: 77.59 } },
  to: { id: `${id}-t`, name: toName, coord: { lat: 12.29, lng: 76.64 } },
  distanceKm: km,
  durationMin: min,
  polyline: [],
  maneuvers: [],
  corridorRadiusM: 2000,
  sizeBytes: Math.round(km * 380_000), // ~380 KB/km rough estimate
  downloadedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  status: 'ready',
});

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

export const useRoutesStore = create<RoutesState>((set, get) => ({
  routes: [
    sample('r1', 'Bengaluru', 'Mysuru', 145, 180),
    sample('r2', 'Manali', 'Leh', 472, 1080),
    sample('r3', 'Mumbai', 'Goa', 590, 720),
  ],
  recent: [
    { id: 'p1', name: 'Nandi Hills', subtitle: 'Karnataka', coord: { lat: 13.37, lng: 77.68 } },
    { id: 'p2', name: 'Coorg', subtitle: 'Karnataka', coord: { lat: 12.42, lng: 75.73 } },
  ],
  favorites: [
    { id: 'h', name: 'Home', subtitle: 'HSR Layout', coord: { lat: 12.91, lng: 77.64 } },
    { id: 'w', name: 'Workshop', subtitle: 'Indiranagar', coord: { lat: 12.97, lng: 77.64 } },
  ],
  addRoute: (r) => set((s) => ({ routes: [r, ...s.routes.filter((x) => x.id !== r.id)] })),
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
