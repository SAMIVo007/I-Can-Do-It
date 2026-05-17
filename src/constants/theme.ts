/**
 * Slate & Sage Design System
 *
 * A refined, editorial minimalist design system.
 * Strict flat-surface rules — 0px shadows, no gradients.
 */

import { Platform } from 'react-native';

// ─── Color Palette ─────────────────────────────────────────────
export const Colors = {
  background: '#FAF9F6',    // Pale Stone — primary background
  surface: '#F5F5F5',       // Light Gray — flat card fill
  textPrimary: '#333333',   // Obsidian — body text & UI labels
  textHeading: '#121212',   // Pitch Black — major headings only
  accent: '#36454F',        // Slate Blue — primary interaction
  success: '#9DC183',       // Sage Green — progress & completion
  border: '#E0E0E0',        // Platinum — 1px subtle borders
  tertiary: '#52402B',      // Tertiary Brown
  white: '#FFFFFF',
  transparent: 'transparent',
  textSecondary: '#888888',
  danger: '#D9534F',
} as const;

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
