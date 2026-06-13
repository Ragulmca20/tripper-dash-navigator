/**
 * ocrService — extracts SSID + password from a captured dash photo.
 * Production: ML Kit Text Recognition (Android) / Vision (iOS) via a thin native module.
 */
export type OcrResult = { ssid?: string; password?: string; rawText: string };

export const ocrService = {
  /** Mock: pretend the dash screen contained these credentials. */
  async recognize(_imageUri: string): Promise<OcrResult> {
    await new Promise((r) => setTimeout(r, 1200));
    return {
      ssid: 'TripperDash_A4F1',
      password: '12345678',
      rawText: 'WiFi: TripperDash_A4F1\nPass: 12345678',
    };
  },
};
