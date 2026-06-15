/**
 * ocrService — extracts SSID + password from a captured dash photo.
 * Production: ML Kit Text Recognition (Android) / Vision (iOS) via a thin native module.
 */
export type OcrResult = { ssid?: string; password?: string; rawText: string };

export const ocrService = {
  async recognize(_imageUri: string): Promise<OcrResult> {
    throw new Error('OCR recognition is not implemented. Install the native OCR module for your platform.');
  },
};
