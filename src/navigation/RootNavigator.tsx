import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '@/theme';
import { BottomTabs } from './BottomTabs';
import { RouteDetailScreen } from '@/features/routes/RouteDetailScreen';
import { DownloadScreen } from '@/features/routes/DownloadScreen';
import MapLibreNavigationScreen from '@/features/navigate/MapLibreNavigationScreen';
import { DashPreviewScreen } from '@/features/dash/DashPreviewScreen';
import RoutePreviewScreen from '@/features/routes/RoutePreviewScreen';
import RoutePlannerScreen from '@/features/routes/RoutePlannerScreen';

export type RootStackParams = {
  Tabs: undefined;
  RouteDetail: { routeId: string };
  Download: { routeId: string };
  MapLibreNavigation: { routeId?: string };
  DashPreview: { routeId?: string };
  RoutePreview: { routeId: string };
  RoutePlanner: undefined;
};

const Stack = createNativeStackNavigator<RootStackParams>();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.divider,
    primary: colors.amber,
    notification: colors.amber,
  },
};

export const RootNavigator = () => (
  <NavigationContainer theme={navTheme}>
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.amber,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="Tabs" component={BottomTabs} options={{ headerShown: false }} />
      <Stack.Screen name="RouteDetail" component={RouteDetailScreen} options={{ title: 'Route' }} />
      <Stack.Screen name="Download" component={DownloadScreen} options={{ title: 'Downloading' }} />
      <Stack.Screen name="MapLibreNavigation" component={MapLibreNavigationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DashPreview" component={DashPreviewScreen} options={{ title: 'Dash Preview' }} />
      <Stack.Screen name="RoutePreview" component={RoutePreviewScreen} options={{ title: 'Route Preview' }} />
      <Stack.Screen name="RoutePlanner" component={RoutePlannerScreen} options={{ title: 'Plan Route' }} />
    </Stack.Navigator>
  </NavigationContainer>
);
