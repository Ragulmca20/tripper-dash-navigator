import { create } from 'zustand';
import type { NavSession } from '@/types';

type Maneuver = { glyph?: string; distanceM?: number; instruction?: string };
type LatLngLike = { latitude: number; longitude: number };

type NavState = {
  // legacy / session-style API
  session?: NavSession;
  start: (routeId: string, etaMin?: number, remainingKm?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  tick: (patch: Partial<NavSession>) => void;

  // live navigation telemetry (used by NavigationMapScreen, DashView)
  coords?: LatLngLike;
  heading: number;
  speedKmh: number;
  etaMinutes: number;
  remainingKm: number;
  remainingIndex: number;
  nextManeuver?: Maneuver;
  setLocation: (coord: LatLngLike, speedMs: number) => void;
  setHeading: (h: number) => void;
  setManeuver: (m: Maneuver) => void;
  setRemainingIndex: (i: number) => void;
  // Drive mode: when true the map centers and rotates with heading and
  // disables user panning. Controlled by the UI toggle in NavigationMapScreen.
  driveMode: boolean;
  setDriveMode: (v: boolean) => void;
};

export const useNavStore = create<NavState>((set) => ({
  session: undefined,
  heading: 0,
  speedKmh: 0,
  etaMinutes: 0,
  remainingKm: 0,
  remainingIndex: 0,
  nextManeuver: undefined,

  start: (routeId, etaMin = 0, remainingKm = 0) =>
    set({
      session: {
        routeId,
        startedAt: Date.now(),
        paused: false,
        progress: 0,
        etaMin,
        remainingKm,
      },
      etaMinutes: etaMin,
      remainingKm,
    }),
  pause: () => set((s) => (s.session ? { session: { ...s.session, paused: true } } : s)),
  resume: () => set((s) => (s.session ? { session: { ...s.session, paused: false } } : s)),
  stop: () => set({ session: undefined, coords: undefined, speedKmh: 0 }),
  tick: (patch) =>
    set((s) => (s.session ? { session: { ...s.session, ...patch } } : s)),

  setLocation: (coord, speedMs) =>
    set({ coords: coord, speedKmh: Math.max(0, (speedMs ?? 0) * 3.6) }),
  setHeading: (h) => set({ heading: h }),
  setManeuver: (m) => set({ nextManeuver: m }),
  setRemainingIndex: (i) => set({ remainingIndex: i }),
  driveMode: false,
  setDriveMode: (v: boolean) => set({ driveMode: v }),
}));
