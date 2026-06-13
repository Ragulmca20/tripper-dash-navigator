import React from 'react';
import { Marker, LatLng } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/theme';

type Props = {
  coordinate: LatLng;
  heading?: number;
};

/**
 * Heading-aware location puck. Uses flat Marker with rotation so the chevron
 * stays aligned with the user's actual bearing even when the map rotates.
 */
export default function UserPuck({ coordinate, heading = 0 }: Props) {
  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      flat
      rotation={heading}
      tracksViewChanges={false}
    >
      <View style={styles.halo}>
        <View style={styles.puck}>
          <View style={styles.chevron} />
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  halo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,180,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  puck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    borderWidth: 3,
    borderColor: '#0A0A0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    position: 'absolute',
    top: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.accent,
  },
});
