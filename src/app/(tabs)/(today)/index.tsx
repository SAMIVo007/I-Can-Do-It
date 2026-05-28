/**
 * Today — Daily Dashboard screen.
 * Shows greeting, overall progress ring, and today's habit cards.
 */

import AddHabitSheet from "@/components/add-habit";
import { Card } from "@/components/ui/card";
import { HabitCard } from "@/components/ui/habit-card";
import { HabitMenu } from "@/components/ui/habit-menu";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Body, Heading } from "@/components/ui/typography";
import { Fonts, Spacing } from "@/constants/theme";
import { useAppColors } from "@/hooks/use-app-colors";
import { useStorage } from "@/hooks/use-storage";
import { useToday } from "@/hooks/use-today";
import { useHabitStore } from "@/stores/habit-store";
import { toDateKey } from "@/utils/date";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, View, ViewStyle } from "react-native";
import Animated, {
	FadeInDown,
	LinearTransition,
} from "react-native-reanimated";

export default function TodayScreen() {
	const Colors = useAppColors();
	const { dateFormatted, greeting } = useToday();
	const [userName] = useStorage("userName", "there");
	const today = toDateKey();
	const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);

	const allHabits = useHabitStore((s) => s.habits);
	const habits = React.useMemo(
		() => allHabits.filter((h) => h.isActive),
		[allHabits],
	);
	const logs = useHabitStore((s) => s.logs);
	const toggleHabit = useHabitStore((s) => s.toggleHabit);
	const updateProgress = useHabitStore((s) => s.updateProgress);
	const deleteHabit = useHabitStore((s) => s.deleteHabit);

	const getLogForHabit = (habitId: string) =>
		logs.find((l) => l.habitId === habitId && l.date === today);

	const completedCount = habits.filter((h) => {
		const log = getLogForHabit(h.id);
		if (!log) return false;
		if (h.type === "boolean") return log.value === 1;
		return log.value >= (h.target ?? 1);
	}).length;
	const totalCount = habits.length;
	const completionRate = totalCount > 0 ? completedCount / totalCount : 0;

	const handleToggle = async (habitId: string) => {
		if (process.env.EXPO_OS === "ios") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		await toggleHabit(habitId, today);
	};

	const handleIncrement = async (habitId: string, amount: number) => {
		if (process.env.EXPO_OS === "ios") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		const log = getLogForHabit(habitId);
		const currentValue = log?.value ?? 0;
		await updateProgress(habitId, today, currentValue + amount);
	};

	const getMomentumMessage = () => {
		if (totalCount === 0) return "Add some habits to get started!";
		if (completionRate >= 1) return "Perfect day! All habits completed! 🎉";
		if (completionRate >= 0.75) return "Great Momentum!";
		if (completionRate >= 0.5) return "Halfway there, keep going!";
		if (completionRate > 0) return "Good start, keep the momentum!";
		return "Start your day strong!";
	};

	return (
		<>
			<View style={{ flex: 1, backgroundColor: Colors.background }}>
				<ScrollView
					contentInsetAdjustmentBehavior="automatic"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{
						padding: Spacing.xl,
						paddingBottom: Spacing.xxxl * 3, // Extra padding for the FAB
						paddingTop: Spacing.xxxl,
						gap: Spacing.xl,
					}}
				>
					{/* Header */}
					<Animated.View entering={FadeInDown.duration(400)}>
						<View style={{ gap: Spacing.xs } satisfies ViewStyle}>
							<View
								style={{
									flexDirection: "row",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<Heading size="lg" italic>
									{greeting},
								</Heading>
							</View>
							<Heading size="xl">{userName}!</Heading>
							<Body secondary style={{ marginTop: Spacing.sm }}>
								{dateFormatted}
							</Body>
						</View>
					</Animated.View>

					{/* Momentum Card */}
					<Animated.View entering={FadeInDown.duration(400).delay(100)}>
						<Card variant="filled" padding="lg">
							<View
								style={
									{
										flexDirection: "row",
										alignItems: "center",
										gap: Spacing.xl,
									} satisfies ViewStyle
								}
							>
								<ProgressRing
									progress={completionRate}
									size={80}
									strokeWidth={6}
									color={completionRate >= 1 ? Colors.success : Colors.accent}
								/>
								<View style={{ flex: 1, gap: Spacing.xs }}>
									<Body weight="bold" size="lg">
										{getMomentumMessage()}
									</Body>
									<Body secondary size="sm">
										You've completed {completedCount} out of {totalCount} daily habits.
										{completionRate < 1 && " Keep it up!"}
									</Body>
								</View>
							</View>
						</Card>
					</Animated.View>

					{/* Today's Habits */}
					<Animated.View
						entering={FadeInDown.duration(400).delay(200)}
						style={{ gap: Spacing.md }}
					>
						<Body
							weight="bold"
							size="sm"
							style={{
								textTransform: "uppercase",
								letterSpacing: 1,
								color: Colors.textSecondary,
							}}
						>
							Today's Habits
						</Body>

						{habits.length === 0 ? (
							<Card variant="bordered" padding="lg">
								<View
									style={{
										alignItems: "center",
										gap: Spacing.md,
										paddingVertical: Spacing.xl,
									}}
								>
									<Body secondary>No habits yet. Tap + to add your first habit!</Body>
								</View>
							</Card>
						) : (
							<View style={{ gap: Spacing.md }}>
								{habits.map((habit, index) => (
									<Animated.View
										key={habit.id}
										entering={FadeInDown.duration(300).delay(300 + index * 50)}
										layout={LinearTransition.springify()}
									>
										<HabitMenu habitId={habit.id}>
											<HabitCard
												habit={habit}
												log={getLogForHabit(habit.id)}
												onToggle={() => handleToggle(habit.id)}
												onIncrement={(amount) => handleIncrement(habit.id, amount)}
												onPress={() => {
													router.push(`/habit/${habit.id}` as any);
												}}
											/>
										</HabitMenu>
									</Animated.View>
								))}
							</View>
						)}
					</Animated.View>
				</ScrollView>

				{/* FAB — Add Habit (Fixed) */}
				<Pressable
					// onPress={() => router.push("/add-habit" as any)}
					onPress={() => setIsAddHabitOpen(true)}
					style={({ pressed }) =>
						({
							position: "absolute",
							bottom: Spacing.xxxl,
							right: Spacing.xl,
							width: 56,
							height: 56,
							borderRadius: 28,
							backgroundColor: Colors.accent,
							alignItems: "center",
							justifyContent: "center",
							opacity: pressed ? 0.85 : 1,
							boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
						}) satisfies ViewStyle
					}
				>
					<Body
						style={{
							color: Colors.white,
							fontSize: 28,
							lineHeight: 30,
							fontFamily: Fonts.utilityLight,
						}}
					>
						+
					</Body>
				</Pressable>
			</View>
			{isAddHabitOpen && (
				<AddHabitSheet isOpen={isAddHabitOpen} onClosed={() => setIsAddHabitOpen(false)} />
			)
			}
		</>
	);
}
