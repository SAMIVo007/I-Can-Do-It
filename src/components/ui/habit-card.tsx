/**
 * HabitCard — a row in "Today's Habits" list.
 * Shows checkbox, title, subtitle, progress bar (if quantitative), and category pill.
 * Per DESIGN.md: completed habits get strikethrough + 50% opacity dimming.
 */

import { CategoryPill } from "@/components/ui/category-pill";
import { Checkbox } from "@/components/ui/checkbox";
import { Body } from "@/components/ui/typography";
import { Colors, Radii, Spacing } from "@/constants/theme";
import type { DailyLog, Habit } from "@/types/models";
import { getProgress, isHabitComplete } from "@/types/models";
import React from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";

interface HabitCardProps {
	habit: Habit;
	log: DailyLog | undefined;
	onToggle: () => void;
	onPress?: () => void;
}

export function HabitCard({ habit, log, onToggle, onPress }: HabitCardProps) {
	const completed = isHabitComplete(habit, log);
	const progress = getProgress(habit, log);

	return (
		<Animated.View
			entering={FadeIn.duration(300)}
			layout={LinearTransition}
			style={{ borderRadius: Radii.lg, overflow: "hidden" }}
		>
			<Pressable
				onPress={onPress}
				style={({ pressed }) => [
					{
						flexDirection: "row",
						alignItems: "center",
						backgroundColor: Colors.surface,
						borderRadius: Radii.lg,
						borderCurve: "continuous",
						padding: Spacing.lg,
						gap: Spacing.md,
						opacity: pressed ? 0.9 : 1,
						transform: [{ scale: pressed ? 0.99 : 1 }],
					} satisfies ViewStyle,
				]}
				android_ripple={{
					foreground: true,
					// radius: 100,
					// borderless: true,
					color: Colors.border,
				}}
			>
				{/* Checkbox */}
				<Checkbox checked={completed} onToggle={onToggle} />

				{/* Content */}
				<View style={{ flex: 1, gap: Spacing.xs } satisfies ViewStyle}>
					<Body
						weight={completed ? "light" : "medium"}
						dimmed={completed}
						strikethrough={completed}
						size="lg"
					>
						{habit.title}
					</Body>

					{/* Subtitle */}
					{habit.type === "quantitative" && habit.target && habit.unit ? (
						<Body size="sm" secondary>
							{log?.value ?? 0} / {habit.target} {habit.unit}
						</Body>
					) : habit.description ? (
						<Body size="sm" secondary dimmed={completed}>
							{habit.description}
						</Body>
					) : null}

					{/* Progress bar for quantitative habits */}
					{habit.type === "quantitative" && (
						<View
							style={
								{
									height: 4,
									backgroundColor: Colors.border,
									borderRadius: 2,
									overflow: "hidden",
									marginTop: Spacing.xs,
								} satisfies ViewStyle
							}
						>
							<Animated.View
								style={{
									height: "100%",
									width: `${Math.min(progress * 100, 100)}%` as `${number}%`,
									backgroundColor: completed ? Colors.success : Colors.accent,
									borderRadius: 2,
								}}
							/>
						</View>
					)}
				</View>

				{/* Category pill */}
				<CategoryPill label={habit.category} compact />
			</Pressable>
		</Animated.View>
	);
}
