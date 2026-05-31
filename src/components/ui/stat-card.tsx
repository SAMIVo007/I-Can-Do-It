/**
 * StatCard — metric card for analytics (e.g. "Current Streak: 14 days").
 */

import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { Spacing, Radii } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { Body, DataText } from '@/components/ui/typography';

interface StatCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}

export function StatCard({ icon, label, value, unit, color }: StatCardProps) {
  const Colors = useAppColors();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: Radii.lg,
        borderCurve: 'continuous',
        padding: Spacing.lg,
        gap: Spacing.sm,
      } satisfies ViewStyle}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs } satisfies ViewStyle}>
        {icon}
        <Body size="sm" secondary>{label}</Body>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: Spacing.xs } satisfies ViewStyle}>
        <DataText size="xl" style={color ? { color } : undefined}>
          {value}
        </DataText>
        {unit && <Body size="sm" secondary>{unit}</Body>}
      </View>
    </View>
  );
}
