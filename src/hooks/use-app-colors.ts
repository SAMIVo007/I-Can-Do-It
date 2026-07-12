/**
 * useAppColors — subscribes the calling component to system theme changes.
 *
 * By calling useColorScheme() internally, any component that uses this hook
 * will automatically re-render whenever the user switches between Light / Dark
 * mode, causing PlatformColor values (Colors.*) to resolve to the correct shade.
 *
 * Usage:
 *   const Colors = useAppColors();
 */

import { Colors, LightColors, DarkColors } from '@/constants/theme';
import { useColorScheme, AppState } from 'react-native';
import { useEffect, useState } from 'react';
import { storage } from '@/utils/storage';

export function useAppColors() {
  const colorScheme = useColorScheme();
  
  // Get the current app theme from storage reactively
  const [appTheme, setAppTheme] = useState(() => storage.get<"system" | "light" | "dark">("appTheme", "system"));

  useEffect(() => {
    // Listen to theme preference changes in storage
    const unsubscribe = storage.subscribe("appTheme", () => {
      setAppTheme(storage.get("appTheme", "system"));
    });
    return unsubscribe;
  }, []);

  // Force re-render when app is brought to foreground (to catch wallpaper changes)
  const [focusKey, setFocusKey] = useState(0);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        setFocusKey((prev) => prev + 1);
      }
    });
    return () => subscription.remove();
  }, []);

  // If theme is system, use PlatformColors (Colors) which support Monet/dynamic wallpaper colors.
  // Spread into a new object so the reference changes whenever colorScheme changes —
  // this forces memoized components (React Compiler) to re-render and re-resolve PlatformColor tokens.
  if (appTheme === "system") {
    return { ...Colors };
  }

  // If manually overridden, return static light/dark palettes to bypass PlatformColor limitations on Android
  return colorScheme === 'dark' ? DarkColors : LightColors;
}
