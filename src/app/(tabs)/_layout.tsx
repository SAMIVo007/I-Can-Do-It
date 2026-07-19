/**
 * NativeTabs layout — 4 tabs: Today, Progress, Goals, Settings.
 * Uses SDK 55 NativeTabs with SF Symbols + Material Symbols.
 *
 * Explicit colors + remount key so the tab bar follows the app theme
 * (system toggle OR in-app light/dark), not only the OS chrome.
 */

import { useAppColors, useResolvedColorScheme } from "@/hooks/use-app-colors";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";

export default function TabLayout() {
  const Colors = useAppColors();
  const scheme = useResolvedColorScheme();

  return (
    <NativeTabs
      key={scheme}
      backgroundColor={Colors.surface}
      indicatorColor={Colors.accent}
      // Selected icon sits on the accent pill — must contrast with it
      // (same accent-on-accent made the active icon disappear).
      iconColor={{
        default: Colors.textSecondary,
        selected: Colors.background,
      }}
      labelStyle={{
        default: { color: Colors.textSecondary },
        selected: { color: Colors.accent },
      }}
      rippleColor={Colors.border}
    >
      <NativeTabs.Trigger name="(today)">
        <NativeTabs.Trigger.Icon
          sf={{ default: "calendar", selected: "calendar" }}
          md="today"
        />
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(goals)">
        <NativeTabs.Trigger.Icon
          sf={{ default: "trophy", selected: "trophy.fill" }}
          md="emoji_events"
        />
        <NativeTabs.Trigger.Label>Goals</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(progress)">
        <NativeTabs.Trigger.Icon
          sf={{ default: "chart.bar", selected: "chart.bar.fill" }}
          md="bar_chart"
        />
        <NativeTabs.Trigger.Label>Progress</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(settings)">
        <NativeTabs.Trigger.Icon
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
          md="settings"
        />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
