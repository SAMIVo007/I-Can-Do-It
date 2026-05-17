/**
 * Add Habit — modal screen for creating a new habit.
 */

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Body, Heading } from "@/components/ui/typography";
import { Colors, Radii, Spacing } from "@/constants/theme";
import { useHabitStore } from "@/stores/habit-store";
import type { HabitCategory, HabitType } from "@/types/models";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import React, { useState } from "react";
import {
	Alert,
	Keyboard,
	Pressable,
	ScrollView,
	View,
	type ViewStyle,
} from "react-native";

const CATEGORIES: HabitCategory[] = [
	"Health",
	"Fitness",
	"Learning",
	"Mindfulness",
	"Finance",
	"Creative",
];

export default function AddHabitScreen() {
	const [title, setTitle] = useState("");
	const [category, setCategory] = useState<HabitCategory>("Health");
	const [habitType, setHabitType] = useState<HabitType>("boolean");
	const [target, setTarget] = useState("");
	const [unit, setUnit] = useState("");

	const goals = useHabitStore((s) => s.goals);
	const addHabit = useHabitStore((s) => s.addHabit);

	const handleCreate = async () => {
		if (!title.trim()) {
			Alert.alert("Missing Title", "Please enter a habit name.");
			return;
		}
		const goalId = goals.length > 0 ? goals[0].id : "";
		if (!goalId) {
			Alert.alert("No Goal", "Please create a goal first.");
			return;
		}

		if (process.env.EXPO_OS === "ios") {
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		}

		await addHabit({
			goalId,
			title: title.trim(),
			category,
			type: habitType,
			target:
				habitType === "quantitative" ? Number(target) || undefined : undefined,
			unit: habitType === "quantitative" ? unit || undefined : undefined,
		});
		router.back();
	};

	return (
		<ScrollView
			contentContainerStyle={{
				padding: Spacing.xl,
				gap: Spacing.xl,
			}}
			style={{
				backgroundColor: Colors.background,
				borderTopLeftRadius: Radii.xl,
				borderTopRightRadius: Radii.xl,
				overflow: "hidden",
			}}
			keyboardShouldPersistTaps="handled"
		>
			{/* Header */}
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					width: "100%",
				}}
			>
				<Heading>New Habit</Heading>
				<Pressable
					onPress={() => {
						Keyboard.dismiss();
						router.back();
					}}
					hitSlop={12}
					style={{ padding: 4 }}
				>
					<SymbolView
						name={{ ios: "xmark", android: "close", web: "close" }}
						size={24}
						tintColor={Colors.textPrimary}
						fallback={
							<Body style={{ color: Colors.textPrimary, fontSize: 18 }}>✕</Body>
						}
					/>
				</Pressable>
			</View>

			{/* Input */}
			<TextInput
				label="Habit Name"
				value={title}
				onChangeText={setTitle}
				placeholder="e.g., Morning Run, Read 20 Pages"
				autoFocus
			/>

			{/* Category */}
			<View style={{ gap: Spacing.md }}>
				<Body
					size="xs"
					weight="medium"
					style={{
						textTransform: "uppercase",
						letterSpacing: 1,
						color: Colors.textSecondary,
					}}
				>
					Category
				</Body>
				<View
					style={
						{
							flexDirection: "row",
							flexWrap: "wrap",
							gap: Spacing.sm,
						} satisfies ViewStyle
					}
				>
					{CATEGORIES.map((cat) => (
						<Pressable
							key={cat}
							onPress={() => setCategory(cat)}
							style={
								{
									paddingVertical: Spacing.sm,
									paddingHorizontal: Spacing.md,
									borderRadius: Radii.xl,
									borderWidth: 1,
									borderColor: category === cat ? Colors.accent : Colors.border,
									backgroundColor: category === cat ? Colors.accent : Colors.transparent,
								} satisfies ViewStyle
							}
						>
							<Body
								size="sm"
								style={{
									color: category === cat ? Colors.white : Colors.textPrimary,
								}}
							>
								{cat}
							</Body>
						</Pressable>
					))}
				</View>
			</View>

			{/* Type Toggle */}
			<View style={{ gap: Spacing.md }}>
				<Body
					size="xs"
					weight="medium"
					style={{
						textTransform: "uppercase",
						letterSpacing: 1,
						color: Colors.textSecondary,
					}}
				>
					Progress Type
				</Body>
				<View style={{ flexDirection: "row", gap: Spacing.sm }}>
					<Pressable
						onPress={() => setHabitType("boolean")}
						style={
							{
								flex: 1,
								paddingVertical: Spacing.md,
								borderRadius: Radii.md,
								borderWidth: 1,
								borderColor: habitType === "boolean" ? Colors.accent : Colors.border,
								backgroundColor:
									habitType === "boolean" ? Colors.accent : Colors.transparent,
								alignItems: "center",
							} satisfies ViewStyle
						}
					>
						<Body
							size="sm"
							style={{
								color: habitType === "boolean" ? Colors.white : Colors.textPrimary,
							}}
						>
							Yes / No
						</Body>
					</Pressable>
					<Pressable
						onPress={() => setHabitType("quantitative")}
						style={
							{
								flex: 1,
								paddingVertical: Spacing.md,
								borderRadius: Radii.md,
								borderWidth: 1,
								borderColor:
									habitType === "quantitative" ? Colors.accent : Colors.border,
								backgroundColor:
									habitType === "quantitative" ? Colors.accent : Colors.transparent,
								alignItems: "center",
							} satisfies ViewStyle
						}
					>
						<Body
							size="sm"
							style={{
								color: habitType === "quantitative" ? Colors.white : Colors.textPrimary,
							}}
						>
							Measurable
						</Body>
					</Pressable>
				</View>
			</View>

			{/* Quantitative fields */}
			{habitType === "quantitative" && (
				<View style={{ flexDirection: "row", gap: Spacing.md }}>
					<View style={{ flex: 1 }}>
						<TextInput
							label="Target"
							value={target}
							onChangeText={setTarget}
							placeholder="e.g., 2"
							keyboardType="numeric"
						/>
					</View>
					<View style={{ flex: 1 }}>
						<TextInput
							label="Unit"
							value={unit}
							onChangeText={setUnit}
							placeholder="e.g., L, pages"
						/>
					</View>
				</View>
			)}

			<Button title="Create Habit" onPress={handleCreate} size="lg" fullWidth />
		</ScrollView>
	);
}
