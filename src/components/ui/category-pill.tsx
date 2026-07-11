/**
 * CategoryPill — small rounded label for habit categories.
 * e.g. "Health", "Learning", "Fitness"
 */

import React from 'react';
import { View, Text, type ViewStyle, type TextStyle } from 'react-native';
import { useAppColors } from '@/hooks/use-app-colors';
import { Fonts, FontSizes, Spacing } from '@/constants/theme';

interface CategoryPillProps {
  label: string;
  selected?: boolean;
  compact?: boolean;
}

export function CategoryPill({ label, selected, compact }: CategoryPillProps) {
  const Colors = useAppColors();
  return (

    <View
      style={[
        {
          paddingVertical: compact ? 2 : Spacing.xs,
          paddingHorizontal: compact ? Spacing.sm : Spacing.md,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: selected ? Colors.accent : Colors.border,
          backgroundColor: selected ? Colors.accent : Colors.transparent,
          // alignSelf: "flex-start",
        } satisfies ViewStyle,
      ]}
    >
      <Text
        style={{
          fontFamily: Fonts.utility,
          fontSize: compact ? FontSizes.xs : FontSizes.sm,
          color: selected ? Colors.white : Colors.textPrimary,
        } satisfies TextStyle}
      >
        {label}
      </Text>
    </View>
  );
}
