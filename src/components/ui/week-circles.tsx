/**
 * WeekCircles — "This Week" row of 7 progress circles (Mon–Sun).
 * Always renders in a single row — no wrapping.
 */

import { NativeCircularProgress } from '@/components/ui/native-progress';
import { Body } from '@/components/ui/typography';
import { Spacing } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import type { DaySummary } from '@/types/models';
import { View, type ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface WeekCirclesProps {
  days: DaySummary[];
}

const CIRCLE_SIZE = 36;
const STROKE_WIDTH = 3;

export function WeekCircles({ days }: WeekCirclesProps) {
  const Colors = useAppColors();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' } satisfies ViewStyle}>
      {days.map((day) => (
        <View key={day.date} style={{ alignItems: 'center', gap: Spacing.xs } satisfies ViewStyle}>
          <DayCircle day={day} colors={Colors} />
          <Body
            size="xs"
            weight={day.isToday ? 'bold' : 'regular'}
            style={day.isToday ? { color: Colors.accent } : undefined}
          >
            {day.dayLabel}
          </Body>
          {day.isToday && (
            <View style={{
              width: 4, height: 4, borderRadius: 2,
              backgroundColor: Colors.accent,
            }} />
          )}
        </View>
      ))}
    </View>
  );
}

function DayCircle({ day, colors: Colors }: { day: DaySummary; colors: ReturnType<typeof useAppColors> }) {
  const isFull = day.completionRate >= 1;

  if (day.isFuture) {
    return (
      <View style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={{ position: 'absolute' }}>
          <Circle cx={CIRCLE_SIZE / 2} cy={CIRCLE_SIZE / 2} r={(CIRCLE_SIZE - STROKE_WIDTH) / 2} stroke={Colors.border} strokeWidth={STROKE_WIDTH} fill="none" />
        </Svg>
      </View>
    );
  }

  return (
    <NativeCircularProgress
      progress={day.completionRate}
      size={CIRCLE_SIZE}
      strokeWidth={STROKE_WIDTH}
      color={isFull ? Colors.success : Colors.accent}
      trackColor={Colors.border}
      showLabel={false}
    >
      {isFull && (
        <Svg width={14} height={14} viewBox="0 0 24 24">
          <Path d="M5 13l4 4L19 7" stroke={Colors.success} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      )}
    </NativeCircularProgress>
  );
}
