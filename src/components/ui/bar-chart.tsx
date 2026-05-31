/**
 * BarChart — Monthly overview bar chart using react-native-svg.
 * Flat, no gradients. Highlighted "today" bar in accent, rest in success.
 * Fixed date labels: only shows every 5th day, 1st, last, and today to prevent overflow.
 */

import React from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Spacing } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { Body } from '@/components/ui/typography';
import type { MonthlyBar } from '@/types/models';

interface BarChartProps {
  data: MonthlyBar[];
  height?: number;
}

const BAR_WIDTH = 8;
const BAR_GAP = 4;

/** Show label for 1st, every 5th, last, and today — avoids overlap. */
function shouldShowLabel(index: number, total: number, isToday: boolean): boolean {
  if (isToday) return true;
  if (index === 0) return true;
  if (index === total - 1) return true;
  if ((index + 1) % 5 === 0) {
    // Hide day 30 if total is 31, to avoid collision with the last day
    if (total === 31 && index === 29) return false;
    return true;
  }
  return false;
}

export function BarChart({ data, height = 120 }: BarChartProps) {
  const Colors = useAppColors();
  const maxValue = Math.max(...data.map((d) => d.habitsCompleted), 1);
  const chartWidth = data.length * (BAR_WIDTH + BAR_GAP);

  return (
    <Animated.View entering={FadeInUp.duration(500)}>
      <View style={{ height, justifyContent: 'flex-end' } satisfies ViewStyle}>
        <Svg width={chartWidth} height={height}>
          {data.map((bar, i) => {
            const barHeight = (bar.habitsCompleted / maxValue) * (height - 20);
            const x = i * (BAR_WIDTH + BAR_GAP);
            const y = height - barHeight - 10;
            return (
              <Rect
                key={bar.day}
                x={x}
                y={y}
                width={BAR_WIDTH}
                height={Math.max(barHeight, 2)}
                rx={3}
                fill={bar.isToday ? Colors.accent : Colors.success}
                opacity={bar.habitsCompleted === 0 ? 0.2 : 1}
              />
            );
          })}
        </Svg>
      </View>
      {/* X-axis labels — spaced to prevent overflow */}
      <View style={{ flexDirection: 'row', width: chartWidth, marginTop: Spacing.xs } satisfies ViewStyle}>
        {data.map((bar, i) => (
          <View key={bar.day} style={{ width: BAR_WIDTH + BAR_GAP, alignItems: 'center' }}>
            {shouldShowLabel(i, data.length, bar.isToday) && (
              <Body
                size="xs"
                secondary
                weight={bar.isToday ? 'bold' : 'regular'}
                numberOfLines={1}
                style={{ fontSize: 9 }}
              >
                {bar.day}
              </Body>
            )}
          </View>
        ))}
      </View>
    </Animated.View>
  );
}
