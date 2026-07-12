/**
 * HabitCard — a row in "Today's Habits" list.
 * Shows checkbox, title, subtitle, progress bar (if quantitative), and category pill.
 * Per DESIGN.md: completed habits get strikethrough + 50% opacity dimming.
 */

import { CategoryPill } from "@/components/ui/category-pill";
import { Checkbox } from "@/components/ui/checkbox";
import { NativeLinearProgress } from "@/components/ui/native-progress";
import { Body } from "@/components/ui/typography";
import { Radii, Spacing } from "@/constants/theme";
import { useAppColors } from "@/hooks/use-app-colors";
import type { DailyLog, Habit } from "@/types/models";
import { getProgress, isHabitComplete } from "@/types/models";
import { SymbolView } from "expo-symbols";
import { Pressable, View, type GestureResponderEvent, type ViewStyle } from "react-native";

interface HabitCardProps {
	habit: Habit;
	log: DailyLog | undefined;
	onToggle: () => void;
	onPress?: () => void;
	onLongPress?: () => void;
	onIncrement?: (amount: number) => void;
	/**
	 * Label for the pill. Pass the parent goal's focusArea so habits show
	 * their goal's domain. Falls back to the habit's own category.
	 */
	categoryLabel?: string;
}

export function HabitCard({
	habit,
	log,
	onToggle,
	onPress,
	onLongPress,
	onIncrement,
	categoryLabel,
}: HabitCardProps) {
	const Colors = useAppColors();
	const completed = isHabitComplete(habit, log);
	const progress = getProgress(habit, log);

	return (
		<View style={{ borderRadius: Radii.lg, overflow: "hidden" }}>
			{/* The background that captures touches for the card */}
			<Pressable
				onPress={onPress}
				onLongPress={onLongPress}
				unstable_pressDelay={100}
				style={({ pressed }) => [
					{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: Colors.surface,
						borderRadius: Radii.lg,
						borderCurve: "continuous",
						opacity: pressed ? 0.9 : 1,
					} satisfies ViewStyle,
				]}
				android_ripple={{
					foreground: true,
					color: Colors.border,
				}}
			/>

			{/* The foreground content, with box-none so touches pass through to the background EXCEPT on interactive children */}
			<View
				pointerEvents="box-none"
				style={{
					flexDirection: "row",
					alignItems: "center",
					padding: Spacing.lg,
					gap: Spacing.md,
				}}
			>
				{/* Checkbox or Increment */}
				{habit.type === "boolean" ? (
					<View pointerEvents="auto">
						<Checkbox checked={completed} onToggle={onToggle} />
					</View>
				) : (
					<View pointerEvents="auto">
						<Pressable
							onPress={(event: GestureResponderEvent) => {
								event.stopPropagation();
								onIncrement?.(habit.incrementValue || 1);
							}}
							unstable_pressDelay={100}
							style={({ pressed }) => ({
								minWidth: 30,
								height: 30,
								paddingHorizontal: Spacing.xs,
								borderRadius: 16,
								backgroundColor: completed ? Colors.success : Colors.background,
								borderWidth: completed ? 0 : 1,
								borderColor: Colors.border,
								alignItems: "center",
								justifyContent: "center",
								opacity: pressed ? 0.7 : 1,
								zIndex: 2
							})}
							android_ripple={{ borderless: true, radius: 80, foreground: true, color: Colors.accent }}
							hitSlop={20}
						>
							{completed ? (
								<SymbolView
									name={{ ios: "checkmark", android: "check", web: "check" }}
									size={20}
									tintColor={Colors.white}
									fallback={<Body style={{ color: Colors.white, fontSize: 18 }}>✓</Body>}
								/>
							) : (
								<Body size="sm" weight="medium" style={{ color: Colors.textPrimary }}>
									+{habit.incrementValue || 1}
								</Body>
							)}
						</Pressable>
					</View>
				)}

				{/* Content */}
				<View style={{ flex: 1, gap: Spacing.xs }} pointerEvents="none">
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
						<View style={{ marginTop: Spacing.xs, width: '100%' }}>
							<NativeLinearProgress
								progress={progress}
								height={4}
								color={completed ? Colors.success : Colors.accent}
								trackColor={Colors.border}
							/>
						</View>
					)}
				</View>

				{/* Category pill */}
				<View pointerEvents="none">
					<CategoryPill label={categoryLabel ?? habit.category} compact />
				</View>
			</View>
		</View>
	);
}
