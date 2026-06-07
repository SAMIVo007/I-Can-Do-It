/**
 * Goals — list of colour-themed goal cards. Tap a card → full-screen goal detail.
 * "New Goal" lives in an expanding FAB (like the Today screen) so the header
 * stays clean and the subtitle never wraps.
 */

import { GOAL_COLORS } from "@/app/add-goal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FAB } from "@/components/ui/fab";
import { NativeCircularProgress } from "@/components/ui/native-progress";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Body, Heading } from "@/components/ui/typography";
import { Radii, Spacing } from "@/constants/theme";
import { useAppColors } from "@/hooks/use-app-colors";
import { useHabitStore } from "@/stores/habit-store";
import { isHabitComplete } from "@/types/models";
import { toDateKey } from "@/utils/date";
import { router } from "expo-router";
import React from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import Animated, {
	FadeInDown,
	LinearTransition,
	useAnimatedScrollHandler,
	useSharedValue,
	withDelay,
	withSequence,
	withTiming,
} from "react-native-reanimated";

const DEFAULT_GOAL_COLOR = GOAL_COLORS[0];

export default function GoalsScreen() {
	const Colors = useAppColors();
	const goals = useHabitStore((s) => s.goals);
	const habits = useHabitStore((s) => s.habits);
	const logs = useHabitStore((s) => s.logs);
	const today = toDateKey();

	// ── Expanding FAB scroll behavior (mirrors Today) ─────────────
	const expandTarget = useSharedValue(1);
	const wasAtTop = useSharedValue(true);

	React.useEffect(() => {
		expandTarget.value = withDelay(2500, withTiming(0, { duration: 0 }));
	}, []);

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (e) => {
			const isAtTop = e.contentOffset.y <= 20;
			if (isAtTop && !wasAtTop.value) {
				expandTarget.value = withSequence(
					withTiming(1, { duration: 0 }),
					withDelay(2500, withTiming(0, { duration: 0 }))
				);
			} else if (!isAtTop && wasAtTop.value) {
				expandTarget.value = 0;
			}
			wasAtTop.value = isAtTop;
		},
	});

	return (
		<View style={{ flex: 1, backgroundColor: Colors.background }}>
			<Animated.ScrollView
				onScroll={scrollHandler}
				scrollEventThrottle={16}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					padding: Spacing.xl,
					paddingBottom: Spacing.xxxl * 3,
					paddingTop: Spacing.xxxl,
					gap: Spacing.xl,
				}}
			>
				{/* Header — clean, full-width, no competing button */}
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
								<Body style={{ fontSize: 48 }}>🎯</Body>
								<Heading size="md">No goals yet</Heading>
								<Body secondary style={{ textAlign: "center" }}>
									Goals give your habits a purpose — the "why" behind what you do
									every day.
								</Body>
								<Button
									title="Create your first goal"
									onPress={() => router.push("/add-goal" as any)}
								/>
							</View>
						</Card>
					</Animated.View>
				) : (
					goals.map((goal, index) => {
						const goalColor = goal.color ?? DEFAULT_GOAL_COLOR;
						const goalEmoji = goal.emoji ?? "🎯";

						const goalHabits = habits.filter(
							(h) => h.goalId === goal.id && h.isActive
						);
						const completedToday = goalHabits.filter((h) => {
							const log = logs.find((l) => l.habitId === h.id && l.date === today);
							return isHabitComplete(h, log);
						}).length;
						const progress =
							goalHabits.length > 0 ? completedToday / goalHabits.length : 0;

						return (
							<Animated.View
								key={goal.id}
								entering={FadeInDown.duration(300).delay(index * 80)}
								layout={LinearTransition.springify()}
							>
								<View style={{ borderRadius: Radii.lg, overflow: "hidden" }}>
									<Pressable
										onPress={() => router.push(`/goal/${goal.id}` as any)}
										android_ripple={{ color: goalColor + "22", foreground: true }}
										style={({ pressed }) => ({
											opacity: pressed ? 0.95 : 1,
										})}
									>
										<Card
											variant="filled"
											padding="lg"
											style={{
												backgroundColor: goalColor + "14",
												borderWidth: 1,
												borderColor: goalColor + "33",
											}}
										>
											<View style={{ gap: Spacing.lg }}>
												{/* Top row */}
												<View
													style={{
														flexDirection: "row",
														alignItems: "center",
														gap: Spacing.md,
													}}
												>
													<View
														style={{
															width: 48,
															height: 48,
															borderRadius: Radii.md,
															backgroundColor: Colors.white,
															borderWidth: 1.5,
															borderColor: goalColor,
															alignItems: "center",
															justifyContent: "center",
															flexShrink: 0,
														}}
													>
														<Body style={{ fontSize: 24 }}>{goalEmoji}</Body>
													</View>

													<View style={{ flex: 1, gap: 2 }}>
														<Heading size="md">{goal.title}</Heading>
														<Body size="xs" secondary>
															{goalHabits.length} habit
															{goalHabits.length !== 1 ? "s" : ""}
															{goalHabits.length > 0
																? ` · ${completedToday} done today`
																: ""}
														</Body>
													</View>

													<NativeCircularProgress
														progress={progress}
														size={48}
														strokeWidth={4}
														color={progress >= 1 ? Colors.success : goalColor}
														labelSize="sm"
													/>
												</View>

												{/* Habit chips */}
												{goalHabits.length > 0 && (
													<>
														<View
															style={{
																height: 1,
																backgroundColor: goalColor + "26",
															}}
														/>
														<View
															style={
																{
																	flexDirection: "row",
																	flexWrap: "wrap",
																	gap: Spacing.sm,
																} satisfies ViewStyle
															}
														>
															{goalHabits.slice(0, 3).map((h) => {
																const log = logs.find(
																	(l) => l.habitId === h.id && l.date === today
																);
																const done = isHabitComplete(h, log);
																return (
																	<View
																		key={h.id}
																		style={{
																			flexDirection: "row",
																			alignItems: "center",
																			gap: Spacing.xs,
																			backgroundColor: Colors.white,
																			paddingVertical: Spacing.xs,
																			paddingHorizontal: Spacing.sm,
																			borderRadius: Radii.sm,
																		}}
																	>
																		<Body
																			size="xs"
																			style={{
																				color: done ? goalColor : Colors.textSecondary,
																			}}
																		>
																			{done ? "✓ " : ""}
																			{h.title}
																		</Body>
																	</View>
																);
															})}
															{goalHabits.length > 3 && (
																<View
																	style={{
																		flexDirection: "row",
																		alignItems: "center",
																		paddingVertical: Spacing.xs,
																		paddingHorizontal: Spacing.sm,
																		borderRadius: Radii.sm,
																		backgroundColor: Colors.white,
																	}}
																>
																	<Body size="xs" secondary>
																		+{goalHabits.length - 3}
																	</Body>
																</View>
															)}
														</View>
													</>
												)}
											</View>
										</Card>
									</Pressable>
								</View>
							</Animated.View>
						);
					})
				)}
			</Animated.ScrollView>

			{/* FAB — New Goal */}
			<FAB
				onPress={() => router.push("/add-goal" as any)}
				isExpanded={expandTarget}
				label="New Goal"
				expandedWidth={140}
			/>
		</View>
	);
}
