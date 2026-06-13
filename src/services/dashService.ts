/**
 * dashService — interface for streaming the rendered navigation frame
 * to the Royal Enfield Tripper Dash over Wi-Fi.
 *
 * NATIVE INTEGRATION NOTES:
 * - Implement a native module (Android: Kotlin / iOS: Swift) that:
 *   1. Joins the Tripper Dash SSID (uses DEFAULT_DASH_PASSWORD 12345678).
 *   2. Opens a TCP or WebSocket channel to the dash on its known port.
 *   3. Accepts 526x300 RGBA/JPEG frames and pushes them at ~15-30 fps.
 * - Replace `mock*` implementations below with bridge calls.
 */
import { DEFAULT_DASH_PASSWORD } from '@/store/connectionStore';

export type DashFrame = { width: 526; height: 300; data: ArrayBuffer };

export interface DashService {
  connect(ssid: string, password?: string): Promise<void>;
  disconnect(): Promise<void>;
  sendFrame(frame: DashFrame): Promise<void>;
  isConnected(): boolean;
}

class MockDashService implements DashService {
  private connected = false;
  async connect(ssid: string, password = DEFAULT_DASH_PASSWORD) {
    await new Promise((r) => setTimeout(r, 800));
    if (!ssid) throw new Error('SSID required');
    // eslint-disable-next-line no-console
    console.log('[dash] connect', { ssid, password: password.replace(/./g, '•') });
    this.connected = true;
  }
  async disconnect() { this.connected = false; }
  async sendFrame(_f: DashFrame) { /* native bridge */ }
  isConnected() { return this.connected; }
}

export const dashService: DashService = new MockDashService();
