/**
 * BaseMap — shared MapView wrapper for Tripper Dash Navigator.
 *
 * Uses react-native-maps:
 *   - Android: Google Maps provider (requires API key in app.json)
 *   - iOS:     Apple Maps by default; pass provider={PROVIDER_GOOGLE} to switch.
 *
 * Offline tiles: when `offlineMode` is true, we overlay a UrlTile that reads
 * from `${FileSystem.documentDirectory}tiles/{z}/{x}/{y}.png`. Populate that
 * directory in `routeDownloadService` when the user downloads a corridor.
 *
 * If you need *vector* offline (smaller, restyleable), swap react-native-maps
 * for @maplibre/maplibre-react-native — the props surface is similar but the
 * tile pipeline is fundamentally different.
 */
import React, { forwardRef, useMemo } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import MapView, {
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
  Region,
  UrlTile,
  MapViewProps,
} from 'react-native-maps';
import * as FileSystem from 'expo-file-system';
import { colors } from '@/theme';
import { darkMapStyle } from './mapStyle';

export type BaseMapProps = MapViewProps & {
  offlineMode?: boolean;
  /** Force Google provider on iOS too (e.g. for parity with Android tiles). */
  useGoogleOnIOS?: boolean;
  children?: React.ReactNode;
};

const TILE_DIR = `${FileSystem.documentDirectory ?? ''}tiles`;

export const DEFAULT_REGION: Region = {
  latitude: 12.9716,
  longitude: 77.5946,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const BaseMap = forwardRef<MapView, BaseMapProps>(function BaseMap(
  { offlineMode = false, useGoogleOnIOS = false, children, style, ...rest },
  ref,
) {
  const provider = useMemo(() => {
    if (Platform.OS === 'android') return PROVIDER_GOOGLE;
    return useGoogleOnIOS ? PROVIDER_GOOGLE : PROVIDER_DEFAULT;
  }, [useGoogleOnIOS]);

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={ref}
        provider={provider}
        style={StyleSheet.absoluteFill}
        customMapStyle={darkMapStyle}
        showsCompass={false}
        showsMyLocationButton={false}
        showsPointsOfInterest={false}
        showsTraffic={false}
        showsBuildings={false}
        toolbarEnabled={false}
        rotateEnabled
        pitchEnabled
        initialRegion={DEFAULT_REGION}
        {...rest}
      >
        {offlineMode && (
          <UrlTile
            urlTemplate={`${TILE_DIR}/{z}/{x}/{y}.png`}
            maximumZ={17}
            minimumZ={6}
            tileSize={256}
            zIndex={-1}
          />
        )}
        {children}
      </MapView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
});

export default BaseMap;
