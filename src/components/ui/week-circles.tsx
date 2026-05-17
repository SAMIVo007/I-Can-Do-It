/**
 * WeekCircles — "This Week" row of 7 progress circles (Mon–Sun).
 */

import React from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors, Spacing } from '@/constants/theme';
import { Body } from '@/components/ui/typography';
import type { DaySummary } from '@/types/models';

interface WeekCirclesProps {
  days: DaySummary[];
}

const CIRCLE_SIZE = 36;
const STROKE_WIDTH = 3;

export function WeekCircles({ days }: WeekCirclesProps) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, justifyContent: 'center' } satisfies ViewStyle}>
      {days.map((day) => (
        <View key={day.date} style={{ alignItems: 'center', gap: Spacing.xs } satisfies ViewStyle}>
          <DayCircle day={day} />
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

function DayCircle({ day }: { day: DaySummary }) {
  const radius = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = CIRCLE_SIZE / 2;
  const isFull = day.completionRate >= 1;

  if (day.isFuture) {
    return (
      <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
        <Circle cx={center} cy={center} r={radius} stroke={Colors.border} strokeWidth={STROKE_WIDTH} fill="none" />
      </Svg>
    );
  }

  return (
    <View style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={{ position: 'absolute' }}>
        <Circle cx={center} cy={center} r={radius} stroke={Colors.border} strokeWidth={STROKE_WIDTH} fill="none" />
        {day.completionRate > 0 && (
          <Circle
            cx={center} cy={center} r={radius}
            stroke={isFull ? Colors.success : Colors.accent}
            strokeWidth={STROKE_WIDTH} fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - day.completionRate)}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />
        )}
      </Svg>
      {isFull && (
        <Svg width={14} height={14} viewBox="0 0 24 24">
          <Path d="M5 13l4 4L19 7" stroke={Colors.success} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      )}
    </View>
  );
}
