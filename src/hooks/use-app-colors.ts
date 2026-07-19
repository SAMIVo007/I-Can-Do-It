/**
 * useAppColors — concrete theme colors that update live.
 *
 * PlatformColor / Color.android.dynamic.* do NOT re-paint existing views when
 * the system theme changes — that's why content stayed stuck until restart.
 * We always return plain hex palettes so every consumer re-renders correctly.
 *
 * - appTheme "system" → LightColors / DarkColors from useColorScheme()
 * - appTheme "light" | "dark" → that palette (does not wait on Appearance)
 *
 * On Android + system, prefer Material You hex from getMaterialColors when available.
 */

import { LightColors, DarkColors } from "@/constants/theme";
import { storage } from "@/utils/storage";
import { useEffect, useState } from "react";
import { AppState, Platform, useColorScheme } from "react-native";

export type AppColorPalette = typeof LightColors;

export type ResolvedColorScheme = "light" | "dark";

function readAppTheme(): "system" | "light" | "dark" {
  return storage.get<"system" | "light" | "dark">("appTheme", "system");
}

/** Effective light/dark after applying the user's appTheme preference. */
export function useResolvedColorScheme(): ResolvedColorScheme {
  const systemScheme = useColorScheme();
  const [appTheme, setAppTheme] = useState(readAppTheme);

  useEffect(() => {
    return storage.subscribe("appTheme", () => setAppTheme(readAppTheme()));
  }, []);

  if (appTheme === "light" || appTheme === "dark") return appTheme;
  return systemScheme === "dark" ? "dark" : "light";
}

function materialYouPalette(scheme: ResolvedColorScheme): AppColorPalette | null {
  if (Platform.OS !== "android") return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getMaterialColors } = require("@expo/ui/jetpack-compose") as {
      getMaterialColors: (opts?: { scheme?: "light" | "dark" }) => {
        background: string;
        surfaceContainer: string;
        onBackground: string;
        primary: string;
        tertiary: string;
        outline: string;
        onSurfaceVariant: string;
        error: string;
      };
    };
    const m = getMaterialColors({ scheme });
    return {
      background: m.background,
      surface: m.surfaceContainer,
      textPrimary: m.onBackground,
      textHeading: m.onBackground,
      accent: m.primary,
      success: m.tertiary,
      border: m.outline,
      tertiary: m.tertiary,
      white: "#FFFFFF",
      transparent: "transparent",
      textSecondary: m.onSurfaceVariant,
      danger: m.error,
    };
  } catch {
    return null;
  }
}

export function useAppColors(): AppColorPalette {
  const scheme = useResolvedColorScheme();
  const [appTheme, setAppTheme] = useState(readAppTheme);
  // Bump when returning to foreground so Material You / system can refresh.
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    return storage.subscribe("appTheme", () => setAppTheme(readAppTheme()));
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") setGeneration((g) => g + 1);
    });
    return () => sub.remove();
  }, []);

  // Forced light/dark — static Slate & Sage (Appearance may lag; don't wait on it).
  if (appTheme === "light") {
    return { ...LightColors };
  }
  if (appTheme === "dark") {
    return { ...DarkColors };
  }

  // System: prefer live Material You hex on Android; else static light/dark.
  // Never return PlatformColor tokens — they don't refresh existing views in-place.
  void generation;
  const monet = materialYouPalette(scheme);
  if (monet) return monet;
  return scheme === "dark" ? { ...DarkColors } : { ...LightColors };
}
