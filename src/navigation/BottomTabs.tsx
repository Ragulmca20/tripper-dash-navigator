import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, spacing, typography } from '@/theme';
import { SearchScreen } from '@/features/search/SearchScreen';
import { RoutesScreen } from '@/features/routes/RoutesScreen';
import { NavigateScreen } from '@/features/navigate/NavigateScreen';
import { ScannerScreen } from '@/features/scanner/ScannerScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { TabIcon, TabName } from '@/components/TabIcon';

export type TabParams = {
  Search: undefined;
  Routes: undefined;
  Navigate: undefined;
  Scanner: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParams>();

export const BottomTabs = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false, tabBarShowLabel: false }}
    tabBar={(props) => <CustomTabBar {...props} />}
  >
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Routes" component={RoutesScreen} />
    <Tab.Screen name="Navigate" component={NavigateScreen} />
    <Tab.Screen name="Scanner" component={ScannerScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

const ORDER: TabName[] = ['Search', 'Routes', 'Navigate', 'Scanner', 'Settings'];

const CustomTabBar = ({ state, navigation }: any) => (
  <View style={styles.barWrap}>
    <View style={styles.bar}>
      {state.routes.map((route: any, idx: number) => {
        const focused = state.index === idx;
        const name = route.name as TabName;
        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={styles.item}
            hitSlop={8}
          >
            <TabIcon name={name} focused={focused} />
            <Text style={[styles.label, focused && styles.labelOn]}>{name}</Text>
            {focused && <View style={styles.dot} />}
          </Pressable>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  barWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.divider,
    paddingVertical: spacing.sm,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  label: { ...typography.micro, color: colors.textDim },
  labelOn: { color: colors.amber },
  dot: {
    width: 4, height: 4, borderRadius: 2, backgroundColor: colors.amber, marginTop: 2,
  },
});
// Keep ORDER export if a consumer needs canonical tab order.
export { ORDER as TAB_ORDER };
