/**
 * Onboarding Step 3 — Schedule + Finish.
 * Sets up notification preferences and persists all onboarding data.
 */

import React, { useState } from 'react';
import { View, ScrollView, Switch, ActivityIndicator, type ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Spacing } from '@/constants/theme';
import { Heading, Body } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { useHabitStore } from '@/stores/habit-store';
import { useAppColors } from '@/hooks/use-app-colors';
import { storage } from '@/utils/storage';
import { requestNotificationPermissions } from '@/utils/notifications';

export default function OnboardingScheduleScreen() {
  const Colors = useAppColors();
  const { userName, goalTitle, focusArea, selectedHabits, reset } = useOnboardingStore();
  const { addGoal, addHabit } = useHabitStore();
  const [enableReminders, setEnableReminders] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFinish = async () => {
    setIsLoading(true);

    try {
      // Request notification permissions if enabled — don't let a rejected
      // permission prompt block onboarding completion
      if (enableReminders) {
        try {
          await requestNotificationPermissions();
          storage.set('remindersEnabled', true);
        } catch (permError) {
          console.warn('Notification permission request failed:', permError);
        }
      }

      // Save user name
      storage.set('userName', userName);

      // Create goal
      const goal = await addGoal(goalTitle, focusArea ?? 'Custom');

      // Create habits
      for (const habit of selectedHabits) {
        await addHabit({
          goalId: goal.id,
          title: habit.title,
          category: habit.category,
          type: habit.type,
          target: habit.target,
          unit: habit.unit,
        });
      }

      // Mark onboarding complete
      storage.set('hasOnboarded', true);

      // Clean up
      reset();

      // Navigate to tabs
      router.replace('/(tabs)/(today)' as any);
    } catch (error) {
      console.error('Onboarding error:', error);
      setErrorMessage(
        'We could not finish setting up your account. Please try again.\n\n' +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
		<>
			<ScrollView
				contentContainerStyle={{
					flexGrow: 1,
					padding: Spacing.xl,
					paddingTop: Spacing.xxxl * 1.5,
					gap: Spacing.xxl,
				}}
				style={{ backgroundColor: Colors.background }}
			>
				{/* Progress indicator */}
				<View
					style={
						{
							flexDirection: "row",
							gap: Spacing.sm,
							justifyContent: "center",
						} satisfies ViewStyle
					}
				>
					<StepDot />
					<StepDot />
					<StepDot active />
				</View>

				{/* Title */}
				<Animated.View
					entering={FadeInDown.duration(500)}
					style={{ gap: Spacing.md }}
				>
					<Heading size="xl">You're all set!</Heading>
					<Body secondary size="lg">
						Here's a summary of your plan. Let's make it happen.
					</Body>
				</Animated.View>

				{/* Summary Card */}
				<Animated.View entering={FadeInDown.duration(500).delay(100)}>
					<Card variant="filled" padding="lg">
						<View style={{ gap: Spacing.lg }}>
							<View style={{ gap: Spacing.xs }}>
								<Body
									size="xs"
									secondary
									style={{ textTransform: "uppercase", letterSpacing: 1 }}
								>
									Your Goal
								</Body>
								<Heading size="sm">{goalTitle}</Heading>
								{focusArea && (
									<Body size="sm" secondary>
										Focus: {focusArea}
									</Body>
								)}
							</View>

							<View style={{ height: 1, backgroundColor: Colors.border }} />

							<View style={{ gap: Spacing.xs }}>
								<Body
									size="xs"
									secondary
									style={{ textTransform: "uppercase", letterSpacing: 1 }}
								>
									Daily Habits ({selectedHabits.length})
								</Body>
								{selectedHabits.map((h, i) => (
									<View
										key={i}
										style={{
											flexDirection: "row",
											alignItems: "center",
											gap: Spacing.sm,
											paddingVertical: 2,
										}}
									>
										<View
											style={{
												width: 6,
												height: 6,
												borderRadius: 3,
												backgroundColor: Colors.success,
											}}
										/>
										<Body size="sm">{h.title}</Body>
									</View>
								))}
							</View>
						</View>
					</Card>
				</Animated.View>

				{/* Notifications Toggle */}
				<Animated.View entering={FadeInDown.duration(500).delay(200)}>
					<Card variant="bordered" padding="lg">
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<View style={{ flex: 1, gap: Spacing.xs }}>
								<Body weight="medium">Enable Reminders</Body>
								<Body size="sm" secondary>
									We'll nudge you at the right time so you never miss a habit.
								</Body>
							</View>
							<Switch
								value={enableReminders}
								onValueChange={setEnableReminders}
								trackColor={{ false: Colors.border, true: Colors.success }}
								thumbColor={Colors.white}
							/>
						</View>
					</Card>
				</Animated.View>

				{/* Spacer */}
				<View style={{ flex: 1 }} />

				{/* Finish button */}
				<Animated.View entering={FadeInDown.duration(500).delay(300)}>
					<Button
						title={isLoading ? "Setting up..." : "Let's Go →"}
						onPress={handleFinish}
						size="lg"
						fullWidth
						disabled={isLoading}
					/>
				</Animated.View>
			</ScrollView>

			<ConfirmDialog
				visible={errorMessage !== null}
				title="Something went wrong"
				message={errorMessage ?? undefined}
				confirmLabel="OK"
				onConfirm={() => {}}
				onDismiss={() => setErrorMessage(null)}
			/>
		</>
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
