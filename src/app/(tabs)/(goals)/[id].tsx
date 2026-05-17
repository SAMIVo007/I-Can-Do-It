/**
 * Goal Detail — placeholder for goal detail view.
 */

import React from 'react';
import { View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { Heading, Body } from '@/components/ui/typography';
import { useHabitStore } from '@/stores/habit-store';

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const goals = useHabitStore((s) => s.goals);
  const goal = goals.find((g) => g.id === id);

  if (!goal) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <Body>Goal not found</Body>
      </View>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: Spacing.xl, gap: Spacing.xl }}
      style={{ backgroundColor: Colors.background }}
    >
      <Heading size="lg">{goal.title}</Heading>
      <Body secondary>Focus: {goal.focusArea}</Body>
    </ScrollView>
  );
}
