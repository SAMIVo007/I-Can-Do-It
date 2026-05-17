/**
 * Typography components for the Slate & Sage design system.
 *
 * <Heading>  — Newsreader serif for titles and greetings
 * <Body>     — Space Grotesk sans for descriptions and labels
 * <DataText> — Space Grotesk bold uppercase for numerical data
 */

import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { Colors, Fonts, FontSizes } from '@/constants/theme';

// ─── Heading ───────────────────────────────────────────────────

interface HeadingProps extends TextProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'display';
  italic?: boolean;
}

const HEADING_SIZES: Record<string, number> = {
  sm: FontSizes.lg,
  md: FontSizes.xl,
  lg: FontSizes.xxl,
  xl: FontSizes.xxxl,
  display: FontSizes.display,
};

export function Heading({ size = 'lg', italic, style, ...props }: HeadingProps) {
  const fontFamily = italic ? Fonts.voiceItalic : Fonts.voiceBold;
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily,
          fontSize: HEADING_SIZES[size],
          color: Colors.textHeading,
          letterSpacing: -0.3,
        } satisfies TextStyle,
        style,
      ]}
    />
  );
}

// ─── Body ──────────────────────────────────────────────────────

interface BodyProps extends TextProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  weight?: 'light' | 'regular' | 'medium' | 'bold';
  dimmed?: boolean;
  strikethrough?: boolean;
  secondary?: boolean;
}

const BODY_FONTS: Record<string, string> = {
  light: Fonts.utilityLight,
  regular: Fonts.utility,
  medium: Fonts.utilityMedium,
  bold: Fonts.utilityBold,
};

export function Body({
  size = 'md',
  weight = 'regular',
  dimmed,
  strikethrough,
  secondary,
  style,
  ...props
}: BodyProps) {
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: BODY_FONTS[weight],
          fontSize: FontSizes[size],
          color: secondary ? Colors.textSecondary : Colors.textPrimary,
          opacity: dimmed ? 0.5 : 1,
          textDecorationLine: strikethrough ? 'line-through' : 'none',
        } satisfies TextStyle,
        style,
      ]}
    />
  );
}

// ─── DataText ──────────────────────────────────────────────────

interface DataTextProps extends TextProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const DATA_SIZES: Record<string, number> = {
  sm: FontSizes.sm,
  md: FontSizes.lg,
  lg: FontSizes.xxl,
  xl: FontSizes.xxxl,
};

export function DataText({ size = 'lg', style, ...props }: DataTextProps) {
  return (
    <Text
      selectable
      {...props}
      style={[
        {
          fontFamily: Fonts.utilityBold,
          fontSize: DATA_SIZES[size],
          color: Colors.textHeading,
          fontVariant: ['tabular-nums'],
          textTransform: 'uppercase',
        } satisfies TextStyle,
        style,
      ]}
    />
  );
}
