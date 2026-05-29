/**
 * Add Habit — modal screen for creating a new habit.
 */

import { Button } from "@/components/ui/button";
import { NativeBottomSheet } from "@/components/ui/native-bottom-sheet";
import { StepperInput } from "@/components/ui/stepper-input";
import { TextInput } from "@/components/ui/text-input";
import { Body, Heading } from "@/components/ui/typography";
import { Radii, Spacing } from "@/constants/theme";
import { useAppColors } from "@/hooks/use-app-colors";
import { useHabitStore } from "@/stores/habit-store";
import type { HabitCategory, HabitType } from "@/types/models";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
	Alert,
	Pressable,
	TextInput as RNTextInput,
	ScrollView,
	View,
	type ViewStyle,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const CATEGORIES: HabitCategory[] = [
	"Health",
	"Fitness",
	"Learning",
	"Mindfulness",
	"Finance",
	"Creative",
];

export default function AddHabitScreen() {
	const Colors = useAppColors();
	const { id: editId } = useLocalSearchParams<{ id?: string }>();
	const habits = useHabitStore((s) => s.habits);
	const editHabit = editId ? habits.find((h) => h.id === editId) : undefined;

	const [title, setTitle] = useState(editHabit?.title ?? "");
	const [category, setCategory] = useState<HabitCategory>(editHabit?.category ?? "Health");
	const [habitType, setHabitType] = useState<HabitType>(editHabit?.type ?? "boolean");
	const [target, setTarget] = useState(editHabit?.target ? String(editHabit.target) : "");
	const [unit, setUnit] = useState(editHabit?.unit || "");
	const [incrementValue, setIncrementValue] = useState(editHabit?.incrementValue ? String(editHabit.incrementValue) : "1");


	const [isOpen, setIsOpen] = useState(true);
	const inputRef = useRef<RNTextInput>(null);

	useEffect(() => {
		if (!editId) {
			const timer = setTimeout(() => {
				inputRef.current?.focus();
			}, 400);
			return () => clearTimeout(timer);
		}
	}, []);

	const [titleError, setTitleError] = useState("");
	const [targetError, setTargetError] = useState("");
	const [unitError, setUnitError] = useState("");

	const goals = useHabitStore((s) => s.goals);
	const addHabit = useHabitStore((s) => s.addHabit);
	const updateHabit = useHabitStore((s) => s.updateHabit);

	const handleSave = async () => {
		let hasError = false;

		if (!title.trim()) {
			setTitleError("Please enter a habit name.");
			hasError = true;
		} else {
			setTitleError("");
		}

		if (habitType === "quantitative") {
			if (!target.trim() || isNaN(Number(target)) || Number(target) <= 0) {
				setTargetError("Valid number required.");
				hasError = true;
			} else {
				setTargetError("");
			}

			if (!unit.trim()) {
				setUnitError("Unit required.");
				hasError = true;
			} else {
				setUnitError("");
			}
		} else {
			setTargetError("");
			setUnitError("");
		}

		if (hasError) return;

		if (editHabit) {
			await updateHabit(editHabit.id, {
				title: title.trim(),
				category,
				type: habitType,
				target:
					habitType === "quantitative" ? Number(target) || undefined : undefined,
				unit: habitType === "quantitative" ? unit || undefined : undefined,
				incrementValue:
					habitType === "quantitative" ? Number(incrementValue) || 1 : undefined,
			});
		} else {
			const goalId = goals.length > 0 ? goals[0].id : "";
			if (!goalId) {
				Alert.alert("No Goal", "Please create a goal first.");
				return;
			}
			await addHabit({
				goalId,
				title: title.trim(),
				category,
				type: habitType,
				target:
					habitType === "quantitative" ? Number(target) || undefined : undefined,
				unit: habitType === "quantitative" ? unit || undefined : undefined,
				incrementValue:
					habitType === "quantitative" ? Number(incrementValue) || 1 : undefined,
			});
		}
		setIsOpen(false);
	};

	const handleClose = () => {
		router.back();
	};

	return (
		<View style={{ flex: 1 }}>
			<NativeBottomSheet isOpen={isOpen} onClosed={handleClose}>
				<KeyboardAwareScrollView
					contentContainerStyle={{
						padding: Spacing.xl,
						paddingBottom: Spacing.xxxl * 2,
						gap: Spacing.xl,
					}}
					showsVerticalScrollIndicator={false}
					bottomOffset={62}
					style={
						{
							backgroundColor: Colors.background,
						}
					}
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
						<Heading>{editHabit ? "Edit Habit" : "New Habit"}</Heading>
						{/* <Pressable
							onPress={() => {
								Keyboard.dismiss();
								setIsOpen(false);
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
						</Pressable> */}
					</View>

					{/* Input */}
					<View>
						<TextInput
							label="Habit Name"
							value={title}
							onChangeText={(text) => {
								setTitle(text);
								if (titleError) setTitleError("");
							}}
							placeholder="e.g., Morning Run, Read 20 Pages"
							ref={inputRef}
						/>
						{titleError ? (
							<Body size="sm" style={{ color: Colors.danger, marginTop: Spacing.xs }}>
								{titleError}
							</Body>
						) : null}
					</View>

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
											backgroundColor:
												category === cat ? Colors.accent : Colors.transparent,
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
										color:
											habitType === "quantitative" ? Colors.white : Colors.textPrimary,
									}}
								>
									Measurable
								</Body>
							</Pressable>
						</View>
					</View>

					{/* Quantitative fields */}
					{habitType === "quantitative" && (
						<View style={{ gap: Spacing.md }}>
							<View style={{ flexDirection: "row", gap: Spacing.md }}>
								<View style={{ flex: 1 }}>
									<TextInput
										label="Target"
										value={target}
										onChangeText={(text) => {
											setTarget(text);
											if (targetError) setTargetError("");
										}}
										placeholder="e.g., 2"
										keyboardType="numeric"
									/>
									{targetError ? (
										<Body
											size="sm"
											style={{ color: Colors.danger, marginTop: Spacing.xs }}
										>
											{targetError}
										</Body>
									) : null}
								</View>
								<View style={{ flex: 1 }}>
									<TextInput
										label="Unit"
										value={unit}
										onChangeText={(text) => {
											setUnit(text);
											if (unitError) setUnitError("");
										}}
										placeholder="e.g., L, pages"
									/>
									{unitError ? (
										<Body
											size="sm"
											style={{ color: Colors.danger, marginTop: Spacing.xs }}
										>
											{unitError}
										</Body>
									) : null}
								</View>
							</View>
							<View style={{ gap: Spacing.md }} />
							<StepperInput
								label="Increment Value (per tap)"
								value={incrementValue}
								onChangeText={setIncrementValue}
								min={1}
							/>
						</View>
					)}

					<Button
						title={editHabit ? "Save Changes" : "Create Habit"}
						onPress={handleSave}
						size="lg"
						fullWidth
					/>
				</KeyboardAwareScrollView>
			</NativeBottomSheet>
		</View>
	);
}
