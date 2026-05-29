/**
 * Habit Detail — shows habit info and lets user update progress.
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CategoryPill } from "@/components/ui/category-pill";
import { HabitMenu } from "@/components/ui/habit-menu";
import { ProgressRing } from "@/components/ui/progress-ring";
import { TextInput } from "@/components/ui/text-input";
import { Body, Heading } from "@/components/ui/typography";
import { Spacing } from "@/constants/theme";
import { useAppColors } from "@/hooks/use-app-colors";
import { useHabitStore } from "@/stores/habit-store";
import { getProgress, isHabitComplete } from "@/types/models";
import { toDateKey } from "@/utils/date";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HabitDetailScreen() {
	const Colors = useAppColors();
	const insets = useSafeAreaInsets();
	const { id } = useLocalSearchParams<{ id: string }>();
	const habits = useHabitStore((s) => s.habits);
	const habit = habits.find((h) => h.id === id);
	const today = toDateKey();
	const log = useHabitStore((s) => s.logs.find(l => l.habitId === id && l.date === today));
	const updateProgress = useHabitStore((s) => s.updateProgress);
	const toggleHabit = useHabitStore((s) => s.toggleHabit);
	const deleteHabit = useHabitStore((s) => s.deleteHabit);
	const [progressInput, setProgressInput] = useState("");

	if (!habit) {
		return (
			<View
				style={{
					flex: 1,
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: Colors.background,
				}}
			>
				<Body>Habit not found</Body>
			</View>
		);
	}

	const progress = getProgress(habit, log);
	const completed = isHabitComplete(habit, log);

	const handleUpdateProgress = async () => {
		const value = Number(progressInput);
		if (!isNaN(value) && value >= 0) {
			if (process.env.EXPO_OS === "ios") {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			}
			await updateProgress(habit.id, today, value);
			setProgressInput("");
		}
	};

	return (
		<>
			<View style={{
				paddingTop: insets.top + 16,
				paddingHorizontal: Spacing.xl,
				paddingBottom: Spacing.md,
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'space-between',
				backgroundColor: Colors.background,
			}}>
				<Pressable
					onPress={() => router.back()}
					hitSlop={20}
					android_ripple={{ borderless: true, color: Colors.border, radius: 20, foreground: true }}
				>
					<SymbolView
						name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
						size={24}
						tintColor={Colors.textPrimary}
						fallback={<Body style={{ color: Colors.textPrimary, fontSize: 18 }}>←</Body>}
					/>
				</Pressable>

				<Body style={{ flex: 1, textAlign: "left", paddingHorizontal: 16, fontSize: 20, fontWeight: 'medium' }}>
					Habit Details
				</Body>

				<HabitMenu habitId={habit.id} isIcon>
					<SymbolView
						name={
							{
								ios: "ellipsis.circle",
								android: "more_vert",
								web: "more_horiz",
							}
						}
						size={24}
						tintColor={Colors.textPrimary}
						fallback={
							<Body style={{ color: Colors.textPrimary, fontSize: 20 }}>⋮</Body>
						}
					/>
				</HabitMenu>
			</View>

			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerStyle={{ padding: Spacing.xl, gap: Spacing.xl }}
				style={{ backgroundColor: Colors.background }}
			>
				<Animated.View
					entering={FadeInDown.duration(400).delay(200)}
					style={{ alignItems: "center", gap: Spacing.lg }}
				>
					<ProgressRing
						progress={progress}
						size={120}
						strokeWidth={8}
						color={completed ? Colors.success : Colors.accent}
						labelSize="lg"
					/>
					<Heading size="lg">{habit.title}</Heading>
					<CategoryPill label={habit.category} />
				</Animated.View>

				<Animated.View entering={FadeInDown.duration(400).delay(100)}>
					<Card variant="filled" padding="lg">
						<View style={{ gap: Spacing.md }}>
							<DetailRow
								label="Type"
								value={habit.type === "boolean" ? "Yes / No" : "Measurable"}
							/>
							{habit.type === "quantitative" && (
								<>
									<DetailRow label="Target" value={`${habit.target} ${habit.unit}`} />
									<DetailRow
										label="Today's Progress"
										value={`${log?.value ?? 0} ${habit.unit}`}
									/>
								</>
							)}
							<DetailRow
								label="Status"
								value={
									<View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
										<SymbolView
											name={completed ?
												{ ios: "checkmark.circle.fill", android: "check_circle", web: "check_circle" } :
												{ ios: "hourglass", android: "hourglass_top", web: "hourglass_top" }}
											size={20}
											tintColor={completed ? Colors.success : Colors.accent}
											fallback={null}
										/>
										<Body weight="medium">{completed ? "Complete" : "In Progress"}</Body>
									</View>
								}
							/>
						</View>
					</Card>
				</Animated.View>

				<Animated.View
					entering={FadeInDown.duration(400).delay(200)}
					style={{ gap: Spacing.md }}
				>
					{habit.type === "boolean" ? (
						<Button
							title={completed ? "Mark Incomplete" : "Mark Complete"}
							onPress={() => toggleHabit(habit.id, today)}
							variant={completed ? "outlined" : "primary"}
							size="lg"
							fullWidth
						/>
					) : (
						<View style={{ gap: Spacing.md }}>
							<TextInput
								label={`Add Progress (${habit.unit})`}
								value={progressInput}
								onChangeText={setProgressInput}
								placeholder={`e.g., ${habit.target ? (habit.target / 4).toFixed(1) : "0.5"}`}
								keyboardType="numeric"
							/>
							<Button
								title="Update Progress"
								onPress={handleUpdateProgress}
								size="lg"
								fullWidth
								disabled={!progressInput.trim()}
							/>
						</View>
					)}
				</Animated.View>
			</ScrollView >
		</>
	);
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<View
			style={{
				flexDirection: "row",
				justifyContent: "space-between",
				alignItems: "center",
				paddingVertical: Spacing.xs,
			}}
		>
			<Body secondary>{label}</Body>
			{typeof value === "string" ? <Body weight="medium">{value}</Body> : value}
		</View>
	);
}
