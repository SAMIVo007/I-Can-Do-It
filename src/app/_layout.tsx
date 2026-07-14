/**
 * Root layout — loads fonts, hydrates stores, gates onboarding vs. tabs.
 */

import { Colors } from "@/constants/theme";
import { useAppColors } from "@/hooks/use-app-colors";
import { useStorage } from "@/hooks/use-storage";
import { useHabitStore } from "@/stores/habit-store";
import {
  Newsreader_400Regular,
  Newsreader_400Regular_Italic,
  Newsreader_500Medium,
  Newsreader_700Bold,
  useFonts,
} from "@expo-google-fonts/newsreader";
import {
  SpaceGrotesk_300Light,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import * as Notifications from "expo-notifications";
import { DefaultTheme, ThemeProvider, router } from "expo-router";
import { Stack } from "expo-router/stack";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect } from "react";
import { useColorScheme, Appearance, Platform } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { handleNotificationResponse } from "@/utils/notification-actions";
import { prepareNotifications } from "@/utils/notifications";

SplashScreen.preventAutoHideAsync();

function useNotificationObserver() {
  const isHydrated = useHabitStore((s) => s.isHydrated);

  useEffect(() => {
    if (Platform.OS === "web" || !isHydrated) return;

    let cancelled = false;

    async function processResponse(
      response: Notifications.NotificationResponse,
    ) {
      const result = await handleNotificationResponse(response);
      if (cancelled) return;

      if (result.shouldOpenHabit && result.habitId) {
        router.push(`/habit/${result.habitId}` as any);
      }

      Notifications.clearLastNotificationResponse();
    }

    prepareNotifications().catch(() => {});

    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) {
      processResponse(lastResponse);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        processResponse(response);
      },
    );

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, [isHydrated]);
}

export default function RootLayout() {
  const Colors = useAppColors();
  const colorScheme = useColorScheme();
  useNotificationObserver();

  /** Custom theme to match Slate & Sage */
  const SlateTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Colors.background as string,
      card: Colors.background as string,
      text: Colors.textPrimary as string,
      border: Colors.border as string,
      primary: Colors.accent as string,
    },
  };

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

  // Routing between onboarding and the main app is handled declaratively
  // via <Stack.Protected> guards below — no imperative redirect needed.
  const [hasOnboarded] = useStorage("hasOnboarded", false);
  const [appTheme] = useStorage<"system" | "light" | "dark">(
    "appTheme",
    "system",
  );
  const activeThemeName = appTheme === "system" ? colorScheme : appTheme;

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (appTheme === "system") {
      Appearance.setColorScheme("unspecified");
    } else {
      Appearance.setColorScheme(appTheme);
    }
  }, [appTheme]);

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
    <KeyboardProvider>
      <ThemeProvider value={SlateTheme} key={activeThemeName}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Un-onboarded users: only the onboarding flow exists, so the
					    app opens straight into it and seeds the first goal + habits. */}
          <Stack.Protected guard={!hasOnboarded}>
            <Stack.Screen
              name="(onboarding)"
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />
          </Stack.Protected>

          {/* Onboarded users: the main app. Guarded so a fresh user can never
					    land here with an empty database. */}
          <Stack.Protected guard={hasOnboarded}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="add-habit"
              options={{
                presentation: "transparentModal",
                animation: "none",
                headerShown: false,
                title: "Add Habit",
                contentStyle: { backgroundColor: "transparent" },
                headerStyle: { backgroundColor: Colors.background as string },
                headerShadowVisible: false,
                headerTintColor: Colors.accent as string,
              }}
            />
            <Stack.Screen
              name="add-goal"
              options={{
                presentation: "transparentModal",
                animation: "none",
                headerShown: false,
                title: "Add Goal",
                contentStyle: { backgroundColor: "transparent" },
              }}
            />
            <Stack.Screen
              name="habit/[id]"
              options={{
                headerShown: false,
                title: "Habit Details",
                headerStyle: { backgroundColor: Colors.background as string },
                headerShadowVisible: false,
                headerTintColor: Colors.textPrimary as string,
              }}
            />
            <Stack.Screen
              name="goal/[id]"
              options={{
                headerShown: false,
                title: "Goal Details",
                headerStyle: { backgroundColor: Colors.background as string },
                headerShadowVisible: false,
                headerTintColor: Colors.textPrimary as string,
              }}
            />
          </Stack.Protected>

          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </KeyboardProvider>
  );
}
