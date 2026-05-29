/**
 * Onboarding Step 1 — Welcome + Goal Input.
 * Matches mockup 4: "What is your main goal?"
 */

import React from 'react';
import { View, Pressable, type ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Colors, Spacing, Radii, Fonts, FontSizes } from '@/constants/theme';
import { Heading, Body } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { useOnboardingStore } from '@/stores/onboarding-store';
import type { HabitCategory } from '@/types/models';

const FOCUS_AREAS: HabitCategory[] = [
  'Health',
  'Fitness',
  'Learning',
  'Mindfulness',
  'Finance',
  'Creative',
];

export default function OnboardingGoalScreen() {
  const { userName, goalTitle, focusArea, setUserName, setGoalTitle, setFocusArea } = useOnboardingStore();

  const canContinue = userName.trim().length > 0 && goalTitle.trim().length > 0;

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
        <StepDot active />
        <StepDot />
        <StepDot />
      </View>

      {/* Title */}
      <Animated.View entering={FadeInDown.duration(500)} style={{ gap: Spacing.md }}>
        <Heading size="xl">What is your{'\n'}main goal?</Heading>
        <Body secondary size="lg">
          Define a clear, actionable objective to focus your efforts.
        </Body>
      </Animated.View>

      {/* Name input */}
      <Animated.View entering={FadeInDown.duration(500).delay(100)}>
        <TextInput
          label="Your Name"
          value={userName}
          onChangeText={setUserName}
          placeholder="e.g., Alex"
          autoFocus
        />
      </Animated.View>

      {/* Goal input */}
      <Animated.View entering={FadeInDown.duration(500).delay(200)}>
        <TextInput
          label="Primary Goal"
          value={goalTitle}
          onChangeText={setGoalTitle}
          placeholder="e.g., Run a 5k, Learn French"
        />
      </Animated.View>

      {/* Suggested Focus Areas */}
      <Animated.View entering={FadeInDown.duration(500).delay(300)} style={{ gap: Spacing.md }}>
        <Body size="xs" weight="medium" style={{ textTransform: 'uppercase', letterSpacing: 1, color: Colors.textSecondary }}>
          Suggested Focus Areas
        </Body>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm } satisfies ViewStyle}>
          {FOCUS_AREAS.map((area) => (
            <Pressable
              key={area}
              onPress={() => setFocusArea(area)}
              style={{
                paddingVertical: Spacing.sm,
                paddingHorizontal: Spacing.lg,
                borderRadius: Radii.sm,
                borderWidth: 1,
                borderColor: focusArea === area ? Colors.accent : Colors.border,
                backgroundColor: focusArea === area ? Colors.accent : Colors.transparent,
              } satisfies ViewStyle}
            >
              <Body
                size="sm"
                style={{ color: focusArea === area ? Colors.white : Colors.textPrimary }}
              >
                {area === 'Health' ? 'Health & Fitness' : area === 'Finance' ? 'Personal Finance' : area === 'Creative' ? 'Creative Project' : area === 'Fitness' ? 'Career Growth' : area}
              </Body>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Continue button */}
      <Animated.View entering={FadeInDown.duration(500).delay(400)}>
        <Button
          title="Continue"
          onPress={() => router.push('./habits' as any)}
          size="lg"
          fullWidth
          disabled={!canContinue}
        />
      </Animated.View>
    </KeyboardAwareScrollView>
  );
}

function StepDot({ active }: { active?: boolean }) {
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
