/**
 * Today — Daily Dashboard screen.
 * Shows greeting, overall progress ring, and today's habit cards.
 */


import { Card } from "@/components/ui/card";
import { FAB } from "@/components/ui/fab";
import { HabitCard } from "@/components/ui/habit-card";
import { HabitMenu } from "@/components/ui/habit-menu";
import { NativeCircularProgress } from "@/components/ui/native-progress";
import { Body, Heading } from "@/components/ui/typography";
import { Fonts, Spacing } from "@/constants/theme";
import { useAppColors } from "@/hooks/use-app-colors";
import { useStorage } from "@/hooks/use-storage";
import { useToday } from "@/hooks/use-today";
import { useHabitStore } from "@/stores/habit-store";
import { toDateKey } from "@/utils/date";
import * as Haptics from "expo-haptics";
import { triggerHaptic } from "@/utils/haptics";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, View, ViewStyle } from "react-native";
import Animated, {
	FadeInDown,
	LinearTransition,
	useAnimatedScrollHandler,
	useSharedValue,
	withDelay,
	withSequence,
	withTiming,
} from "react-native-reanimated";

export default function TodayScreen() {
	const Colors = useAppColors();
	const { dateFormatted, greeting } = useToday();
	const [userName] = useStorage("userName", "there");
	const today = toDateKey();

	const expandTarget = useSharedValue(1); // 1 = expanded, 0 = collapsed
	const wasAtTop = useSharedValue(true);

	// Initial timeout when screen loads
	React.useEffect(() => {
		expandTarget.value = withDelay(2500, withTiming(0, { duration: 0 }));
	}, []);

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (e) => {
			const isAtTop = e.contentOffset.y <= 20;
			
			if (isAtTop && !wasAtTop.value) {
				// Reached top: expand, wait 2.5s, then collapse
				expandTarget.value = withSequence(
					withTiming(1, { duration: 0 }),
					withDelay(2500, withTiming(0, { duration: 0 }))
				);
			} else if (!isAtTop && wasAtTop.value) {
				// Scrolled down: immediately collapse
				expandTarget.value = 0;
			}
			
			wasAtTop.value = isAtTop;
		},
	});

	const allHabits = useHabitStore((s) => s.habits);
	const habits = React.useMemo(
		() => allHabits.filter((h) => h.isActive),
		[allHabits],
	);
	const goals = useHabitStore((s) => s.goals);
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
			triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
		}
		await toggleHabit(habitId, today);
	};

	const handleIncrement = async (habitId: string, amount: number) => {
		if (process.env.EXPO_OS === "ios") {
			triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
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
		<View style={{ flex: 1, backgroundColor: Colors.background }}>
			<Animated.ScrollView
				onScroll={scrollHandler}
				scrollEventThrottle={16}
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
							<NativeCircularProgress
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
							{habits.map((habit, index) => {
								const goal = goals.find((g) => g.id === habit.goalId);
								return (
									<Animated.View
										key={habit.id}
										entering={FadeInDown.duration(300).delay(300 + index * 50)}
										layout={LinearTransition.springify()}
									>
										{/* Subtle goal label above each card */}
										{goal && (
											<View
												style={{
													flexDirection: "row",
													alignItems: "center",
													gap: Spacing.xs,
													marginBottom: Spacing.xs,
													paddingHorizontal: Spacing.xs,
												}}
											>
												<Body style={{ fontSize: 11 }}>{goal.emoji ?? "🎯"}</Body>
												<Body
													size="xs"
													style={{ color: goal.color ?? Colors.textSecondary }}
												>
													{goal.title}
												</Body>
											</View>
										)}
										<HabitMenu habitId={habit.id}>
											<HabitCard
												habit={habit}
												log={getLogForHabit(habit.id)}
												categoryLabel={goal?.focusArea}
												onToggle={() => handleToggle(habit.id)}
												onIncrement={(amount) => handleIncrement(habit.id, amount)}
											/>
										</HabitMenu>
									</Animated.View>
								);
							})}
						</View>
					)}
				</Animated.View>
			</Animated.ScrollView>

			{/* FAB — Add Habit */}
			<FAB onPress={() => router.push("/add-habit" as any)} isExpanded={expandTarget} />
		</View>
	);
}
