/**
 * Goals — list of user goals with their associated habits.
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CategoryPill } from "@/components/ui/category-pill";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Body, Heading } from "@/components/ui/typography";
import { useAppColors } from "@/hooks/use-app-colors";
import { Spacing } from "@/constants/theme";
import { useHabitStore } from "@/stores/habit-store";
import { toDateKey } from "@/utils/date";
import { router } from "expo-router";
import React from "react";
import { ScrollView, View, type ViewStyle } from "react-native";
import Animated, { FadeInDown, LinearTransition } from "react-native-reanimated";

export default function GoalsScreen() {
	const Colors = useAppColors();
	const goals = useHabitStore((s) => s.goals);
	const habits = useHabitStore((s) => s.habits);
	const logs = useHabitStore((s) => s.logs);
	const today = toDateKey();

	return (
		<ScrollView
			contentInsetAdjustmentBehavior="automatic"
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{
				padding: Spacing.xl,
				paddingBottom: Spacing.xxxl * 2,
				paddingTop: Spacing.xxxl,
				gap: Spacing.xl,
			}}
			style={{ backgroundColor: Colors.background }}
		>
			{/* Header */}
			<Animated.View entering={FadeInDown.duration(400)}>
				<Heading size="xl">Your Goals</Heading>
				<Body secondary style={{ marginTop: Spacing.xs }}>
					The bigger picture you're working towards.
				</Body>
			</Animated.View>

			{goals.length === 0 ? (
				<Animated.View entering={FadeInDown.duration(400)}>
					<Card variant="bordered" padding="lg">
						<View
							style={{
								alignItems: "center",
								gap: Spacing.lg,
								paddingVertical: Spacing.xxl,
							}}
						>
							<Heading size="md">No goals yet</Heading>
							<Body secondary style={{ textAlign: "center" }}>
								Complete the onboarding to set your first goal, or add one below.
							</Body>
							<Button
								title="Add a Goal"
								onPress={() => router.push("/add-habit" as any)}
							/>
						</View>
					</Card>
				</Animated.View>
			) : (
				goals.map((goal, index) => {
					const goalHabits = habits.filter(
						(h) => h.goalId === goal.id && h.isActive,
					);
					const completedToday = goalHabits.filter((h) => {
						const log = logs.find((l) => l.habitId === h.id && l.date === today);
						if (!log) return false;
						if (h.type === "boolean") return log.value === 1;
						return log.value >= (h.target ?? 1);
					}).length;
					const progress =
						goalHabits.length > 0 ? completedToday / goalHabits.length : 0;

					return (
						<Animated.View
							key={goal.id}
							entering={FadeInDown.duration(300).delay(index * 80)}
							layout={LinearTransition.springify()}
						>
							<Card variant="filled" padding="lg">
								<View style={{ gap: Spacing.lg }}>
									{/* Goal Header */}
									<View
										style={{
											flexDirection: "row",
											justifyContent: "space-between",
											alignItems: "center",
										}}
									>
										<View
											style={{
												flex: 1,
												flexDirection: "column",
												gap: Spacing.sm,
												justifyContent: "flex-start",
												alignItems: "flex-start",
											}}
										>
											<Heading size="md">{goal.title}</Heading>
											<CategoryPill label={goal.focusArea} />
										</View>
										<ProgressRing
											progress={progress}
											size={50}
											strokeWidth={4}
											labelSize="sm"
										/>
									</View>

									{/* Habits list */}
									{goalHabits.length > 0 && (
										<View style={{ gap: Spacing.sm }}>
											<Body
												size="xs"
												secondary
												style={{ textTransform: "uppercase", letterSpacing: 1 }}
											>
												{goalHabits.length} habit{goalHabits.length !== 1 ? "s" : ""} ·{" "}
												{completedToday} done today
											</Body>
											{goalHabits.map((h) => (
												<View
													key={h.id}
													style={
														{
															flexDirection: "row",
															alignItems: "center",
															gap: Spacing.sm,
															paddingVertical: Spacing.xs,
														} satisfies ViewStyle
													}
												>
													<View
														style={{
															width: 6,
															height: 6,
															borderRadius: 3,
															backgroundColor: logs.find(
																(l) => l.habitId === h.id && l.date === today,
															)
																? Colors.success
																: Colors.border,
														}}
													/>
													<Body size="sm">{h.title}</Body>
												</View>
											))}
										</View>
									)}
								</View>
							</Card>
						</Animated.View>
					);
				})
			)}
		</ScrollView>
	);
}
