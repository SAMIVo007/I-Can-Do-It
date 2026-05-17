/**
 * Button component — Primary, Outlined, and Ghost variants.
 * Strictly flat per Slate & Sage (0px shadow).
 */

import React from 'react';
import { Pressable, Text, type ViewStyle, type TextStyle } from 'react-native';
import { Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outlined' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  icon,
  fullWidth,
}: ButtonProps) {
  const sizeStyles = SIZE_MAP[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.sm,
          borderCurve: 'continuous',
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        } satisfies ViewStyle,
        sizeStyles.container,
        VARIANT_CONTAINER[variant],
        fullWidth && { width: '100%' as const },
      ]}
    >
      {icon}
      <Text
        style={[
          {
            fontFamily: Fonts.utilityMedium,
            textAlign: 'center',
          } satisfies TextStyle,
          sizeStyles.text,
          VARIANT_TEXT[variant],
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

// ─── Variant Styles ────────────────────────────────────────────

const VARIANT_CONTAINER: Record<string, ViewStyle> = {
  primary: {
    backgroundColor: Colors.accent,
    borderWidth: 0,
  },
  outlined: {
    backgroundColor: Colors.transparent,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghost: {
    backgroundColor: Colors.transparent,
    borderWidth: 0,
  },
};

const VARIANT_TEXT: Record<string, TextStyle> = {
  primary: {
    color: Colors.white,
  },
  outlined: {
    color: Colors.accent,
  },
  ghost: {
    color: Colors.accent,
  },
};

// ─── Size Styles ───────────────────────────────────────────────

const SIZE_MAP: Record<string, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderRadius: Radii.sm },
    text: { fontSize: FontSizes.sm },
  },
  md: {
    container: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: Radii.md },
    text: { fontSize: FontSizes.md },
  },
  lg: {
    container: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xxl, borderRadius: Radii.lg },
    text: { fontSize: FontSizes.lg },
  },
};
