/**
 * Flat Card component.
 * Two variants:
 *   - filled: Light Gray (#F5F5F5) background on Pale Stone
 *   - bordered: 1px Platinum (#E0E0E0) border, transparent bg
 *
 * 0px shadows strictly enforced.
 */

import React from 'react';
import { View, type ViewStyle, type ViewProps } from 'react-native';
import { useAppColors } from '@/hooks/use-app-colors';
import { Radii, Spacing } from '@/constants/theme';

interface CardProps extends ViewProps {
  variant?: 'filled' | 'bordered';
  padding?: 'sm' | 'md' | 'lg';
}

const PADDING_MAP: Record<string, number> = {
  sm: Spacing.md,
  md: Spacing.lg,
  lg: Spacing.xl,
};

export function Card({
  variant = 'filled',
  padding = 'md',
  style,
  children,
  ...props
}: CardProps) {
  const Colors = useAppColors();
  return (
    <View
      {...props}
      style={[
        {
          borderRadius: Radii.lg,
          borderCurve: 'continuous',
          padding: PADDING_MAP[padding],
        } satisfies ViewStyle,
        variant === 'filled'
          ? { backgroundColor: Colors.surface }
          : { borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.transparent },
        style,
      ]}
    >
      {children}
    </View>
  );
}
