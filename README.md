# Tripper Dash Navigator

Premium, offline-first motorcycle navigation that pairs with the **Royal Enfield Tripper Dash**, downloads route-corridor packages, renders custom maps locally, and streams the rendered output to the dashboard at **526 × 300**.

> **Not** a Google Maps wrapper. Not screen mirroring. Not a phone-map clone.
> The app is a rider-first, automotive-styled navigation surface designed for screen-off riding with the dash as the primary display.

---

## 1. Quick start

```bash
# 1. install deps
npm install         # or: bun install / pnpm install / yarn

# 2. run on a device
npx expo start
# press `a` for Android, `i` for iOS
```

Requires Expo SDK 51, Node ≥ 18, and either Xcode or Android Studio installed for native builds. The Scanner screen requires a physical device (camera).

Default dash Wi-Fi password is **`12345678`** (constant `DEFAULT_DASH_PASSWORD` in `src/store/connectionStore.ts`).

---

## 2. Folder structure

```
src/
  theme/              design tokens — colors, spacing, radius, typography
  navigation/         RootNavigator + custom BottomTabs
  components/         reusable UI: SearchBar, RouteCard, StatusBadge,
                      ActionButton, ConnectionTile, StorageUsageCard,
                      Skeleton, EmptyState, ScreenHeader, icons
  features/
    search/           SearchScreen (destination + favorites + recents)
    routes/           RoutesScreen, RouteDetailScreen, DownloadScreen,
                      CorridorPreview
    navigate/         NavigateScreen (control center), NavigationMapScreen
                      (custom map — not a Google Maps clone)
    scanner/          ScannerScreen (camera + OCR + auto-connect)
    settings/         SettingsScreen
    dash/             DashView (526 × 300), DashPreviewScreen
  store/              Zustand stores — connection, routes, nav session
  services/           dashService, ocrService, downloadService, gpsService
                      (all stubbed; clear native-integration notes inline)
  types/              shared domain types
  hooks/  utils/      reserved
App.tsx               providers + root navigator
app.json              Expo config + iOS/Android permissions
```

Feature-based architecture with MVVM separation: **stores** = view-model, **services** = data layer, **screens** = view.

---

## 3. Navigation flow

```
Bottom Tabs ─┬─ Search    ─► RouteDetail ─► Download ─► RouteDetail ─► NavigationMap
             ├─ Routes    ─► RouteDetail ─► NavigationMap
             │                          └─► DashPreview
             ├─ Navigate  ─► NavigationMap ─► DashPreview
             ├─ Scanner   ─► (writes to connection store)
             └─ Settings  ─► DashPreview · sub-pages
```

Implemented with `@react-navigation/native-stack` over `@react-navigation/bottom-tabs`. Custom tab bar lives in `BottomTabs.tsx`.

---

## 4. Design system

All values are tokens. **Never inline a color or hardcoded font size in a screen.**

### Colors (`src/theme/colors.ts`)

| Token         | Value      | Purpose                                  |
|---------------|------------|------------------------------------------|
| `bg`          | `#0A0A0B`  | matte black, primary background          |
| `surface`     | `#121316`  | deep charcoal cards                      |
| `surfaceAlt`  | `#1A1C20`  | graphite — pressed states, secondary btn |
| `surfaceHi`   | `#22252B`  | progress bar tracks, skeleton            |
| `divider`     | `#2A2D33`  | 1px hairlines                            |
| `text`        | `#F5F6F7`  | primary text                             |
| `textMuted`   | `#9AA0A6`  | labels                                   |
| `textDim`     | `#6B7079`  | meta / disabled                          |
| `amber`       | `#FFB400`  | **Royal Enfield amber** — single accent  |
| `electric`    | `#3DA9FC`  | destination + secondary accent           |
| `success`     | `#2ECC71`  | green status                             |
| `warning`     | `#FF8A00`  | orange status                            |
| `danger`      | `#FF4D4F`  | red status                               |
| `dashBg`      | `#000000`  | dash surface — pure black for sun        |
| `routeLine`   | `#FFB400`  | route polyline on map + dash             |

### Typography (`src/theme/typography.ts`)

- **iOS:** SF Pro Display / SF Pro Text
- **Android:** Inter (bundle via `expo-font` for parity)
- Scale: `display 40` → `h1 28` → `h2 22` → `h3 18` → `body 15` → `label 13` → `caption 12` → `micro 10`
- Dash-only: `dashHero 72`, `dashLabel 12 / +1.5 letterSpacing` — sized for 526×300 read distance.

### Spacing & radius

- 4pt grid: `xs 4 · sm 8 · md 12 · lg 16 · xl 20 · xxl 24 · xxxl 32 · huge 48`
- Radius: `sm 8 · md 12 · lg 16 · xl 20 · pill 999` — primary corner radius is **16px**.

---

## 5. State management

Three Zustand stores — small, focused, no boilerplate:

- `connectionStore` — dash / GPS / network status + dash credentials.
- `routesStore` — downloaded packages, favorites, recents.
- `navStore` — active navigation session (start / pause / resume / stop / tick).

Why Zustand: minimal surface area, no providers, easy to consume from native bridge callbacks (e.g. a Wi-Fi listener can call `useConnectionStore.setState(...)` directly).

---

## 6. Native integration map

Each `src/services/*` file documents what the production native module must do. The current stubs return mocked data so the UI runs end-to-end without native code.

| Service           | Replace with                                                                                  |
|-------------------|-----------------------------------------------------------------------------------------------|
| `dashService`     | Native module: join dash SSID (Android `WifiNetworkSpecifier`, iOS `NEHotspotConfiguration`), open TCP/WS socket to dash, push 526×300 frames at 15–24fps. |
| `ocrService`      | ML Kit Text Recognition (Android) / Vision Framework (iOS) wrapped in a thin module.          |
| `downloadService` | Routing engine (Mapbox / Valhalla / OSRM) → buffer polyline by 2 km → fetch MVT/raster tiles into `expo-file-system` → write `manifest.json`. |
| `gpsService`      | Already uses `expo-location`; swap to `expo-task-manager` background task for screen-off nav. |

**Frame pipeline** (suggested): render `<DashView />` to an off-screen `react-native-view-shot` ➜ JPEG-encode ➜ chunk over WebSocket. For 60 fps targets, drop down to a Skia / GL native renderer that consumes the same prop contract as `DashView`.

---

## 7. Offline corridor model

We download **route + 2 km corridor**, never entire regions.

- Corridor = `buffer(polyline, corridorRadiusM)` where `corridorRadiusM` defaults to `2000`.
- Tile request set = intersection(corridor, tileset zooms 11..15).
- Size budget per package ≈ `380 KB per km` of route (see `RouteCard` size estimate). A 600 km ride ≈ 230 MB.
- Visualised by `CorridorPreview` (pure SVG) and the dash's stylised mini-map — both are honest about *what is downloaded*, which is why neither resembles Google Maps.

---

## 8. Custom navigation map (`NavigationMapScreen`)

Deliberately *unlike* Google Maps:

- **Vertical scroll metaphor** — rider puck anchored bottom-center; the route flows upward to the horizon.
- **Single hero glyph** — distance to next maneuver in amber, large, glanceable.
- **No turn-by-turn pop-ups** — a tactical *maneuver tape* sits just under the status row.
- **No clutter chrome** — no compass, no zoom buttons, no search bar inside nav.
- **Tick-mark motion** — subtle Reanimated translation simulates forward motion without battery cost.

Inspired by Garmin Zumo, BMW Connected Ride, KTM TFT instruments — not consumer phone maps.

---

## 9. Dash UI (526 × 300)

`DashView` is a fixed-size component designed for the Tripper Dash resolution.

- Pure black background for sunlight contrast.
- Three columns: `next-maneuver | mini-route | ETA/remaining/speed stack`.
- Single amber accent — no decorative gradients on the dash itself.
- Hero numeric (ETA) at 72px — readable at arm's length in direct sun.
- `DashPreviewScreen` scales it down to fit any phone for QA, with a status panel that confirms stream resolution / encoding / live SSID.

---

## 10. Empty & loading states

- `EmptyState` — used for: no saved routes, no internet, no GPS, dash not paired, OCR failed, download failed.
- `Skeleton` / `SkeletonCard` — animated shimmer for: search results, route list, nav startup.

---

## 11. Responsive rules

- Phones (portrait): primary layout — single column, large tap targets.
- Tablets / foldables: design tokens unchanged; screens that use `FlatList` or stacked `View`s scale naturally. For dashboards, the 526×300 dash view scales by the formula in `DashPreviewScreen` (`Math.min(1, (width − 40) / 526)`).
- Landscape: `NavigationMapScreen` HUD is positioned with `SafeAreaView` edges so it stays clear of phone notches and rotated bezels.
- Safe area: handled via `react-native-safe-area-context` at every screen edge.

---

## 12. Micro-interactions

Powered by `react-native-reanimated`:

- Download progress bar — `withTiming` width interpolation.
- Skeleton shimmer — `withRepeat(withTiming, -1, true)`.
- Map motion ticks — looping translateY.

Battery-aware: all animations run on the UI thread, no JS bridge per frame.

---

## 13. Accessibility

- All text uses semantic tokens that already meet WCAG AA on the matte-black surface (amber on `#0A0A0B` ≈ 11:1).
- Action buttons have minimum 44pt height (`size="md"`) and large 72pt for the primary nav CTA (`size="xl"`).
- All icons are paired with text labels — no icon-only controls.
- Status uses **color + label + position** so it survives colour-blind palettes.

---

## 14. Production checklist before shipping

- [ ] Replace `MockDashService` with a real native module (Wi-Fi join + frame socket).
- [ ] Wire ML Kit / Vision OCR in `ocrService`.
- [ ] Implement real corridor tile downloader in `downloadService`.
- [ ] Add background-location task for screen-off navigation.
- [ ] Bundle Inter via `expo-font` for Android consistency.
- [ ] Add `react-native-view-shot` (or Skia) frame capture pipeline.
- [ ] Confirm `NEHotspotConfiguration` entitlement on iOS for joining the dash SSID.
