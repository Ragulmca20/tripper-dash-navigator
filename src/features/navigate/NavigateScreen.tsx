import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing, typography } from '@/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ConnectionTile } from '@/components/ConnectionTile';
import { ActionButton } from '@/components/ActionButton';
import { Icon } from '@/components/TabIcon';
import { useConnectionStore } from '@/store/connectionStore';
import { useNavStore } from '@/store/navStore';
import { useRoutesStore } from '@/store/routesStore';
import type { RootStackParams } from '@/navigation/RootNavigator';

export const NavigateScreen: React.FC = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const { gps, net, dash, dashSsid } = useConnectionStore();
  const session = useNavStore((s) => s.session);
  const pause = useNavStore((s) => s.pause);
  const resume = useNavStore((s) => s.resume);
  const stop = useNavStore((s) => s.stop);
  const start = useNavStore((s) => s.start);
  const routes = useRoutesStore((s) => s.routes);
  const activeRoute = routes.find((r) => r.id === session?.routeId) ?? routes[0];

  const ready =
    gps === 'locked' &&
    dash === 'connected' &&
    activeRoute?.status === 'ready';

  return (
    <View style={styles.root}>
      <ScreenHeader eyebrow="CONTROL CENTER" title="Navigate" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.grid}>
          <ConnectionTile
            label="GPS"
            status={gps === 'locked' ? 'ok' : gps === 'weak' ? 'warn' : 'err'}
            detail={gps === 'locked' ? 'Lock acquired · 4m accuracy' : 'Acquiring satellites…'}
            icon={<Icon.Sat />}
          />
          <ConnectionTile
            label="INTERNET"
            status={net === 'online' ? 'ok' : 'warn'}
            detail={net === 'online' ? 'Online · used only for downloads' : 'Offline · navigation unaffected'}
            icon={<Icon.Wifi color={colors.amber} />}
          />
        </View>
        <View style={styles.grid}>
          <ConnectionTile
            label="DASH"
            status={dash === 'connected' ? 'ok' : dash === 'connecting' ? 'warn' : 'err'}
            detail={dashSsid ? `Streaming to ${dashSsid}` : 'Use Scanner to pair dash'}
            icon={<Icon.Wifi color={colors.amber} />}
          />
          <ConnectionTile
            label="ROUTE"
            status={activeRoute?.status === 'ready' ? 'ok' : 'warn'}
            detail={activeRoute ? `${activeRoute.from.name} → ${activeRoute.to.name}` : 'No route loaded'}
            icon={<Icon.Pin />}
          />
        </View>

        <View style={styles.heroPanel}>
          <Text style={styles.heroLabel}>{session ? 'NAVIGATING' : ready ? 'READY' : 'PRE-FLIGHT'}</Text>
          <Text style={styles.heroValue}>
            {session ? `${session.remainingKm.toFixed(0)} km · ${Math.round(session.etaMin)} min` :
              activeRoute ? `${activeRoute.distanceKm.toFixed(0)} km · ${Math.round(activeRoute.durationMin)} min` : '—'}
          </Text>
          <Text style={styles.heroSub}>
            {ready
              ? 'All systems nominal. Screen-off navigation will mirror to the dash.'
              : 'Resolve the warnings above to enable screen-off navigation.'}
          </Text>
        </View>

        {!session ? (
          <ActionButton
            label="START NAVIGATION"
            size="xl"
            disabled={!activeRoute}
            icon={<Icon.Play color={colors.bg} />}
            onPress={() => {
              if (!activeRoute) return;
              start(activeRoute.id, activeRoute.durationMin, activeRoute.distanceKm);
              nav.navigate('NavigationMap', { routeId: activeRoute.id });
            }}
          />
        ) : (
          <View style={{ gap: spacing.sm }}>
            <ActionButton
              label={session.paused ? 'RESUME' : 'PAUSE'}
              size="xl"
              variant={session.paused ? 'primary' : 'secondary'}
              icon={session.paused ? <Icon.Play color={colors.bg} /> : <Icon.Pause color={colors.text} />}
              onPress={() => (session.paused ? resume() : pause())}
            />
            <ActionButton
              label="STOP NAVIGATION"
              variant="danger"
              icon={<Icon.Stop color={colors.danger} />}
              onPress={() => stop()}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.xl, gap: spacing.md, paddingBottom: 140 },
  grid: { flexDirection: 'row', gap: spacing.md },
  heroPanel: {
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.divider,
    padding: spacing.xl, gap: spacing.sm, marginTop: spacing.md,
  },
  heroLabel: { ...typography.label, color: colors.amber, letterSpacing: 2 },
  heroValue: { ...typography.display, color: colors.text },
  heroSub: { ...typography.body, color: colors.textMuted },
});
