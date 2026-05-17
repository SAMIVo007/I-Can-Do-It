/**
 * Habit Detail — shows habit info and lets user update progress.
 */

import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Spacing } from '@/constants/theme';
import { Heading, Body } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/ui/progress-ring';
import { CategoryPill } from '@/components/ui/category-pill';
import { TextInput } from '@/components/ui/text-input';
import { useHabitStore } from '@/stores/habit-store';
import { toDateKey } from '@/utils/date';
import { getProgress, isHabitComplete } from '@/types/models';
import * as Haptics from 'expo-haptics';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habits = useHabitStore((s) => s.habits);
  const habit = habits.find((h) => h.id === id);
  const getLogForHabit = useHabitStore((s) => s.getLogForHabit);
  const updateProgress = useHabitStore((s) => s.updateProgress);
  const toggleHabit = useHabitStore((s) => s.toggleHabit);
  const today = toDateKey();
  const [progressInput, setProgressInput] = useState('');

  if (!habit) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <Body>Habit not found</Body>
      </View>
    );
  }

  const log = getLogForHabit(habit.id, today);
  const progress = getProgress(habit, log);
  const completed = isHabitComplete(habit, log);

  const handleUpdateProgress = async () => {
    const value = Number(progressInput);
    if (!isNaN(value) && value >= 0) {
      if (process.env.EXPO_OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await updateProgress(habit.id, today, value);
      setProgressInput('');
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: Spacing.xl, gap: Spacing.xl }}
      style={{ backgroundColor: Colors.background }}
    >
      <Animated.View entering={FadeInDown.duration(400).delay(200)} style={{ alignItems: 'center', gap: Spacing.lg }}>
        <ProgressRing progress={progress} size={120} strokeWidth={8} color={completed ? Colors.success : Colors.accent} labelSize="lg" />
        <Heading size="lg">{habit.title}</Heading>
        <CategoryPill label={habit.category} />
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(100)}>
        <Card variant="filled" padding="lg">
          <View style={{ gap: Spacing.md }}>
            <DetailRow label="Type" value={habit.type === 'boolean' ? 'Yes / No' : 'Measurable'} />
            {habit.type === 'quantitative' && (
              <>
                <DetailRow label="Target" value={`${habit.target} ${habit.unit}`} />
                <DetailRow label="Today's Progress" value={`${log?.value ?? 0} ${habit.unit}`} />
              </>
            )}
            <DetailRow label="Status" value={completed ? '✅ Complete' : '⏳ In Progress'} />
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(200)} style={{ gap: Spacing.md }}>
        {habit.type === 'boolean' ? (
          <Button
            title={completed ? 'Mark Incomplete' : 'Mark Complete'}
            onPress={() => toggleHabit(habit.id, today)}
            variant={completed ? 'outlined' : 'primary'}
            size="lg" fullWidth
          />
        ) : (
          <View style={{ gap: Spacing.md }}>
            <TextInput
              label={`Add Progress (${habit.unit})`}
              value={progressInput}
              onChangeText={setProgressInput}
              placeholder={`e.g., ${habit.target ? (habit.target / 4).toFixed(1) : '0.5'}`}
              keyboardType="numeric"
            />
            <Button title="Update Progress" onPress={handleUpdateProgress} size="lg" fullWidth disabled={!progressInput.trim()} />
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs }}>
      <Body secondary>{label}</Body>
      <Body weight="medium">{value}</Body>
    </View>
  );
}
