/**
 * Root layout — loads fonts, hydrates stores, gates onboarding vs. tabs.
 */

import React, { useEffect, useCallback } from 'react';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Newsreader_400Regular, Newsreader_500Medium, Newsreader_700Bold, Newsreader_400Regular_Italic } from '@expo-google-fonts/newsreader';
import { SpaceGrotesk_300Light, SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { useHabitStore } from '@/stores/habit-store';
import { useStorage } from '@/hooks/use-storage';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

/** Custom theme to match Slate & Sage — strictly light mode */
const SlateTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,
    card: Colors.background,
    text: Colors.textPrimary,
    border: Colors.border,
    primary: Colors.accent,
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Newsreader_400Regular,
    Newsreader_500Medium,
    Newsreader_700Bold,
    Newsreader_400Regular_Italic,
    SpaceGrotesk_300Light,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });

  const hydrate = useHabitStore((s) => s.hydrate);
  const isHydrated = useHabitStore((s) => s.isHydrated);
  const [hasOnboarded] = useStorage('hasOnboarded', false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const onLayoutReady = useCallback(async () => {
    if (fontsLoaded && isHydrated) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isHydrated]);

  useEffect(() => {
    onLayoutReady();
  }, [onLayoutReady]);

  if (!fontsLoaded || !isHydrated) {
    return null;
  }

  return (
    <ThemeProvider value={SlateTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="(onboarding)"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="add-habit"
          options={{
            presentation: 'formSheet',
            headerShown: false,
            title: 'Add Habit',
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.75, 1.0],
            contentStyle: { backgroundColor: 'transparent' },
            headerStyle: { backgroundColor: Colors.background },
            headerShadowVisible: false,
            headerTintColor: Colors.accent,
          }}
        />
        <Stack.Screen
          name="habit/[id]"
          options={{
            headerShown: true,
            title: 'Habit Details',
            headerStyle: { backgroundColor: Colors.background },
            headerShadowVisible: false,
            headerTintColor: Colors.accent,
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
