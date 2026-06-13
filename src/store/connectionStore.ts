import { create } from 'zustand';
import type { DashStatus, GpsStatus, NetStatus } from '@/types';

export const DEFAULT_DASH_PASSWORD = '12345678';

type ConnectionState = {
  dash: DashStatus;
  dashSsid?: string;
  dashPassword: string;
  gps: GpsStatus;
  net: NetStatus;
  setDash: (s: DashStatus, ssid?: string) => void;
  setDashCredentials: (ssid: string, password?: string) => void;
  setGps: (s: GpsStatus) => void;
  setNet: (s: NetStatus) => void;
};

export const useConnectionStore = create<ConnectionState>((set) => ({
  dash: 'disconnected',
  dashSsid: undefined,
  dashPassword: DEFAULT_DASH_PASSWORD,
  gps: 'searching',
  net: 'online',
  setDash: (s, ssid) => set({ dash: s, dashSsid: ssid ?? undefined }),
  setDashCredentials: (ssid, password) =>
    set((st) => ({ dashSsid: ssid, dashPassword: password ?? st.dashPassword })),
  setGps: (s) => set({ gps: s }),
  setNet: (s) => set({ net: s }),
}));
