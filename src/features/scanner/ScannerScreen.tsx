import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { colors, radius, spacing, typography } from '@/theme';
import { ActionButton } from '@/components/ActionButton';
import { Icon } from '@/components/TabIcon';
import { ocrService } from '@/services/ocrService';
import { dashService } from '@/services/dashService';
import { useConnectionStore, DEFAULT_DASH_PASSWORD } from '@/store/connectionStore';

type Detection = { ssid?: string; password?: string };

export const ScannerScreen: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const cam = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);
  const [detected, setDetected] = useState<Detection | null>(null);
  const setDash = useConnectionStore((s) => s.setDash);
  const setCreds = useConnectionStore((s) => s.setDashCredentials);

  useEffect(() => { if (!permission?.granted) requestPermission(); }, [permission, requestPermission]);

  const scan = async () => {
    if (!cam.current || busy) return;
    setBusy(true);
    try {
      const pic = await cam.current.takePictureAsync({ quality: 0.6, skipProcessing: true });
      const ocr = await ocrService.recognize(pic?.uri ?? '');
      setDetected({ ssid: ocr.ssid, password: ocr.password ?? DEFAULT_DASH_PASSWORD });
    } catch (e: any) {
      Alert.alert('OCR failed', e?.message ?? 'Try again with better lighting.');
    } finally {
      setBusy(false);
    }
  };

  const connect = async () => {
    if (!detected?.ssid) return;
    setDash('connecting', detected.ssid);
    setCreds(detected.ssid, detected.password);
    try {
      await dashService.connect(detected.ssid, detected.password);
      setDash('connected', detected.ssid);
    } catch {
      setDash('error');
      Alert.alert('Connection failed', 'Could not join the dash Wi-Fi.');
    }
  };

  if (!permission?.granted) {
    return (
      <View style={[styles.root, { padding: spacing.xl, justifyContent: 'center' }]}>
        <Text style={styles.title}>Camera access required</Text>
        <Text style={styles.body}>The SSID scanner reads the Tripper Dash splash screen to auto-extract Wi-Fi credentials.</Text>
        <ActionButton label="Grant camera access" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView ref={cam} style={StyleSheet.absoluteFill} facing="back" />

      {/* Reticle overlay */}
      <View pointerEvents="none" style={styles.reticleWrap}>
        <View style={styles.reticle}>
          <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
        </View>
        <Text style={styles.hint}>Align the dash Wi-Fi panel inside the frame</Text>
      </View>

      <SafeAreaView edges={['top']} style={styles.top}>
        <Text style={styles.eyebrow}>SSID SCANNER</Text>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.bottom}>
        {detected ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>DETECTED</Text>
            <Text style={styles.resultSsid}>{detected.ssid}</Text>
            <Text style={styles.resultPass}>Password · {detected.password}</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
              <ActionButton label="Rescan" variant="ghost" onPress={() => setDetected(null)} />
              <View style={{ flex: 1 }}>
                <ActionButton label="Connect to Dash" icon={<Icon.Wifi color={colors.bg} />} onPress={connect} fullWidth />
              </View>
            </View>
          </View>
        ) : (
          <Pressable onPress={scan} style={styles.shutter}>
            {busy ? <ActivityIndicator color={colors.bg} /> : <View style={styles.shutterInner} />}
          </Pressable>
        )}
      </SafeAreaView>
    </View>
  );
};

const Corner: React.FC<{ pos: 'tl' | 'tr' | 'bl' | 'br' }> = ({ pos }) => {
  const s: any = { position: 'absolute', width: 28, height: 28, borderColor: colors.amber };
  if (pos.includes('t')) { s.top = -2; s.borderTopWidth = 3; }
  if (pos.includes('b')) { s.bottom = -2; s.borderBottomWidth = 3; }
  if (pos.includes('l')) { s.left = -2; s.borderLeftWidth = 3; }
  if (pos.includes('r')) { s.right = -2; s.borderRightWidth = 3; }
  return <View style={s} />;
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  body: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },
  top: { position: 'absolute', top: 0, left: 0, right: 0, padding: spacing.xl },
  eyebrow: { ...typography.label, color: colors.amber, letterSpacing: 2 },
  reticleWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  reticle: { width: 280, height: 160, borderRadius: 12 },
  hint: { ...typography.body, color: colors.text, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.xl, alignItems: 'center' },
  shutter: {
    width: 76, height: 76, borderRadius: 38, borderWidth: 3, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)',
  },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.amber },
  resultCard: {
    alignSelf: 'stretch', backgroundColor: 'rgba(18,19,22,0.96)', borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.divider, padding: spacing.xl, gap: 4,
  },
  resultLabel: { ...typography.micro, color: colors.amber, letterSpacing: 2 },
  resultSsid: { ...typography.h1, color: colors.text },
  resultPass: { ...typography.mono, color: colors.textMuted, marginTop: 4 },
});
