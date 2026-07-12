/**
 * Onboarding Step 2 — Habit Selection.
 * Matches mockup 1: "Break it down into daily habits" with suggested habits.
 */

import React, { useState } from 'react';
import { View, Pressable, type ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Spacing, Radii } from '@/constants/theme';
import { Heading, Body } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { useOnboardingStore, SUGGESTED_HABITS } from '@/stores/onboarding-store';
import { useAppColors } from '@/hooks/use-app-colors';

export default function OnboardingHabitsScreen() {
  const Colors = useAppColors();
  const { goalTitle, focusArea, selectedHabits, toggleHabit, addCustomHabit } = useOnboardingStore();
  const [customHabitTitle, setCustomHabitTitle] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const suggestedList = focusArea ? SUGGESTED_HABITS[focusArea] : [];
  // Also show some cross-category popular habits
  const extraHabits = [
    ...SUGGESTED_HABITS['Health'].slice(0, 2),
    ...SUGGESTED_HABITS['Fitness'].slice(0, 2),
  ].filter((h) => !suggestedList.some((s) => s.title === h.title));

  const allSuggestions = [...suggestedList, ...extraHabits];
  const canContinue = selectedHabits.length > 0;

  const handleAddCustom = () => {
    if (customHabitTitle.trim()) {
      addCustomHabit({
        title: customHabitTitle.trim(),
        category: focusArea ?? 'Custom',
        type: 'boolean',
      });
      setCustomHabitTitle('');
      setShowCustom(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: Spacing.xl,
        paddingTop: Spacing.xxxl * 1.5,
        gap: Spacing.xxl,
      }}
      style={{ backgroundColor: Colors.background }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Progress indicator */}
      <View style={{ flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center' } satisfies ViewStyle}>
        <StepDot />
        <StepDot active />
        <StepDot />
      </View>

      {/* Title */}
      <Animated.View entering={FadeInDown.duration(500)} style={{ gap: Spacing.md }}>
        <Heading size="xl">Break it down into daily habits</Heading>
        <Body secondary>
          Small, consistent actions build momentum. Select suggested habits or add your own.
        </Body>
      </Animated.View>

      {/* Habit chips */}
      <Animated.View entering={FadeInDown.duration(500).delay(150)} style={{ gap: Spacing.md }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm } satisfies ViewStyle}>
          {allSuggestions.map((habit) => {
            const isSelected = selectedHabits.some((h) => h.title === habit.title);
            return (
              <Pressable
                key={habit.title}
                onPress={() => toggleHabit(habit)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Spacing.xs,
                  paddingVertical: Spacing.sm,
                  paddingHorizontal: Spacing.md,
                  borderRadius: Radii.xl,
                  borderWidth: 1,
                  borderColor: isSelected ? Colors.success : Colors.border,
                  backgroundColor: isSelected ? Colors.success : Colors.transparent,
                } satisfies ViewStyle}
              >
                {isSelected ? (
                  <Svg width={14} height={14} viewBox="0 0 24 24">
                    <Path d="M5 13l4 4L19 7" stroke={Colors.white} strokeWidth={3} strokeLinecap="round" fill="none" />
                  </Svg>
                ) : (
                  <Body size="sm" style={{ color: Colors.textSecondary }}>+</Body>
                )}
                <Body size="sm" style={{ color: isSelected ? Colors.white : Colors.textPrimary }}>
                  {habit.title}
                </Body>
              </Pressable>
            );
          })}
          {/* Custom habits added by user — show as selected pills */}
          {selectedHabits
            .filter((h) => !allSuggestions.some((s) => s.title === h.title))
            .map((habit) => (
              <Pressable
                key={habit.title}
                onPress={() => toggleHabit(habit)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Spacing.xs,
                  paddingVertical: Spacing.sm,
                  paddingHorizontal: Spacing.md,
                  borderRadius: Radii.xl,
                  borderWidth: 1,
                  borderColor: Colors.success,
                  backgroundColor: Colors.success,
                } satisfies ViewStyle}
              >
                <Svg width={14} height={14} viewBox="0 0 24 24">
                  <Path d="M5 13l4 4L19 7" stroke={Colors.white} strokeWidth={3} strokeLinecap="round" fill="none" />
                </Svg>
                <Body size="sm" style={{ color: Colors.white }}>
                  {habit.title}
                </Body>
              </Pressable>
            ))}
        </View>

        {/* Custom habit input */}
        {showCustom ? (
          <Animated.View entering={FadeIn.duration(300)} style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}>
              <TextInput
                label="Custom Habit"
                value={customHabitTitle}
                onChangeText={setCustomHabitTitle}
                placeholder="e.g., Practice Piano"
                autoFocus
              />
            </View>
            <Button title="Add" size="sm" onPress={handleAddCustom} />
          </Animated.View>
        ) : (
          <Pressable
            onPress={() => setShowCustom(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: Spacing.xs,
              paddingVertical: Spacing.sm,
              paddingHorizontal: Spacing.md,
              borderRadius: Radii.xl,
              borderWidth: 1,
              borderColor: Colors.border,
              borderStyle: 'dashed',
              alignSelf: 'flex-start',
            } satisfies ViewStyle}
          >
            <Body size="sm" secondary>✏️ Custom habit...</Body>
          </Pressable>
        )}
      </Animated.View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Continue */}
      <Animated.View entering={FadeInDown.duration(500).delay(300)}>
        <Button
          title="Continue  →"
          onPress={() => router.push('./schedule' as any)}
          size="lg"
          fullWidth
          disabled={!canContinue}
        />
      </Animated.View>
    </KeyboardAwareScrollView>
  );
}

function StepDot({ active }: { active?: boolean }) {
  const Colors = useAppColors();
  return (
    <View
      style={{
        width: active ? 24 : 20,
        height: 4,
        borderRadius: 2,
        backgroundColor: active ? Colors.accent : Colors.border,
      }}
    />
  );
}
