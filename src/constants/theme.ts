/**
 * Slate & Sage Design System
 *
 * A refined, editorial minimalist design system.
 * Strict flat-surface rules — 0px shadows, no gradients.
 */

import { Platform } from 'react-native';
import { Color } from 'expo-router';

// ─── Color Palette ─────────────────────────────────────────────
export const Colors = {
  background: Platform.select({
    ios: Color.ios.systemBackground,
    android: Color.android.dynamic.background,
    default: '#FAF9F6',
  })!,
  surface: Platform.select({
    ios: Color.ios.secondarySystemBackground,
    android: Color.android.dynamic.surfaceContainer,
    default: '#F5F5F5',
  })!,
  textPrimary: Platform.select({
    ios: Color.ios.label,
    android: Color.android.dynamic.onBackground,
    default: '#333333',
  })!,
  textHeading: Platform.select({
    ios: Color.ios.label,
    android: Color.android.dynamic.onBackground,
    default: '#121212',
  })!,
  accent: Platform.select({
    ios: Color.ios.systemBlue,
    android: Color.android.dynamic.primary,
    default: '#36454F',
  })!,
  success: Platform.select({
    ios: Color.ios.systemGreen,
    android: Color.android.dynamic.tertiary,
    default: '#9DC183',
  })!,
  border: Platform.select({
    ios: Color.ios.separator,
    android: Color.android.dynamic.outline,
    default: '#E0E0E0',
  })!,
  tertiary: Platform.select({
    ios: Color.ios.systemBrown,
    android: Color.android.dynamic.tertiary,
    default: '#52402B',
  })!,
  white: '#FFFFFF',
  transparent: 'transparent',
  textSecondary: Platform.select({
    ios: Color.ios.secondaryLabel,
    android: Color.android.dynamic.onSurfaceVariant,
    default: '#888888',
  })!,
  danger: Platform.select({
    ios: Color.ios.systemRed,
    android: Color.android.dynamic.error,
    default: '#D9534F',
  })!,
};

// Static fallback palettes to support manual theme overrides
export const LightColors = {
  background: '#FAF9F6',
  surface: '#F5F5F5',
  textPrimary: '#333333',
  textHeading: '#121212',
  accent: '#36454F',
  success: '#9DC183',
  border: '#E0E0E0',
  tertiary: '#52402B',
  white: '#FFFFFF',
  transparent: 'transparent',
  textSecondary: '#888888',
  danger: '#D9534F',
};

export const DarkColors = {
  background: '#121212',
  surface: '#1A1A1A',
  textPrimary: '#E0E0E0',
  textHeading: '#FFFFFF',
  accent: '#A3B19B',
  success: '#9DC183',
  border: '#2E2E2E',
  tertiary: '#D1C4E9',
  white: '#FFFFFF',
  transparent: 'transparent',
  textSecondary: '#8E8E93',
  danger: '#FF453A',
};


// ─── Typography Tokens ─────────────────────────────────────────
export const Fonts = {
  /** Elegant Serif — App Name, Onboarding Goals, Daily Greeting, Analytics titles */
  voice: Platform.select({
    ios: 'Newsreader_400Regular',
    android: 'Newsreader_400Regular',
    default: 'Newsreader_400Regular',
  })!,
  voiceMedium: Platform.select({
    ios: 'Newsreader_500Medium',
    android: 'Newsreader_500Medium',
    default: 'Newsreader_500Medium',
  })!,
  voiceBold: Platform.select({
    ios: 'Newsreader_700Bold',
    android: 'Newsreader_700Bold',
    default: 'Newsreader_700Bold',
  })!,
  voiceItalic: Platform.select({
    ios: 'Newsreader_400Regular_Italic',
    android: 'Newsreader_400Regular_Italic',
    default: 'Newsreader_400Regular_Italic',
  })!,
  /** Technical Sans — Habit descriptions, dates, labels, button text */
  utility: Platform.select({
    ios: 'SpaceGrotesk_400Regular',
    android: 'SpaceGrotesk_400Regular',
    default: 'SpaceGrotesk_400Regular',
  })!,
  utilityLight: Platform.select({
    ios: 'SpaceGrotesk_300Light',
    android: 'SpaceGrotesk_300Light',
    default: 'SpaceGrotesk_300Light',
  })!,
  utilityMedium: Platform.select({
    ios: 'SpaceGrotesk_500Medium',
    android: 'SpaceGrotesk_500Medium',
    default: 'SpaceGrotesk_500Medium',
  })!,
  utilityBold: Platform.select({
    ios: 'SpaceGrotesk_700Bold',
    android: 'SpaceGrotesk_700Bold',
    default: 'SpaceGrotesk_700Bold',
  })!,
} as const;

// ─── Spacing Scale ─────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// ─── Border Radii ──────────────────────────────────────────────
export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

// ─── Font Sizes ────────────────────────────────────────────────
export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  display: 48,
} as const;
