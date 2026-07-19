/**
 * Add Habit — modal screen for creating a new habit.
 */

import { GOAL_COLORS } from "@/app/add-goal";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { NativeBottomSheet } from "@/components/ui/native-bottom-sheet";
import { StepperInput } from "@/components/ui/stepper-input";
import { NativeTextInput } from "@/components/ui/native-text-input";
import { Body, Heading } from "@/components/ui/typography";
import { Radii, Spacing } from "@/constants/theme";
import { useAppColors } from "@/hooks/use-app-colors";
import { useHabitStore } from "@/stores/habit-store";
import type { HabitCategory, HabitType } from "@/types/models";
import { TimePicker } from "@/components/ui/time-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  View,
  type ViewStyle,
} from "react-native";
import type { TextInputHandle } from "@/components/ui/text-input-types";

export default function AddHabitScreen() {
  const Colors = useAppColors();
  const { id: editId, goalId: preselectedGoalId } = useLocalSearchParams<{
    id?: string;
    goalId?: string;
  }>();
  const habits = useHabitStore((s) => s.habits);
  const goals = useHabitStore((s) => s.goals);
  const editHabit = editId ? habits.find((h) => h.id === editId) : undefined;

  // Goal selection: pre-select from param > edit habit's goal > first goal
  const defaultGoalId =
    editHabit?.goalId ??
    preselectedGoalId ??
    (goals.length > 0 ? goals[0].id : "");

  const [selectedGoalId, setSelectedGoalId] = useState<string>(defaultGoalId);
  const selectedGoal = goals.find((g) => g.id === selectedGoalId);
  const accentColor = String(Colors.accent);

  const [title, setTitle] = useState(editHabit?.title ?? "");
  const [habitType, setHabitType] = useState<HabitType>(
    editHabit?.type ?? "boolean",
  );
  const [target, setTarget] = useState(
    editHabit?.target ? String(editHabit.target) : "",
  );
  const [unit, setUnit] = useState(editHabit?.unit || "");
  const [incrementValue, setIncrementValue] = useState(
    editHabit?.incrementValue ? String(editHabit.incrementValue) : "1",
  );

  const [reminderTimes, setReminderTimes] = useState<string[]>(
    editHabit?.reminderTimes ?? [],
  );
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());

  const [isOpen, setIsOpen] = useState(true);
  const [noGoalVisible, setNoGoalVisible] = useState(false);
  const inputRef = useRef<TextInputHandle>(null);

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

    // Category is no longer asked for — it's derived from the parent goal's
    // focus area. (Column kept for back-compat / existing data.)
    const derivedCategory: HabitCategory =
      selectedGoal?.focusArea ?? editHabit?.category ?? "Health";

    if (editHabit) {
      await updateHabit(editHabit.id, {
        title: title.trim(),
        category: derivedCategory,
        type: habitType,
        target:
          habitType === "quantitative"
            ? Number(target) || undefined
            : undefined,
        unit: habitType === "quantitative" ? unit || undefined : undefined,
        incrementValue:
          habitType === "quantitative"
            ? Number(incrementValue) || 1
            : undefined,
        reminderTimes,
      });
    } else {
      if (!selectedGoalId) {
        setNoGoalVisible(true);
        return;
      }
      await addHabit({
        goalId: selectedGoalId,
        title: title.trim(),
        category: derivedCategory,
        type: habitType,
        target:
          habitType === "quantitative"
            ? Number(target) || undefined
            : undefined,
        unit: habitType === "quantitative" ? unit || undefined : undefined,
        incrementValue:
          habitType === "quantitative"
            ? Number(incrementValue) || 1
            : undefined,
        reminderTimes,
      });
    }
    setIsOpen(false);
  };

  const handleClose = () => {
    router.back();
  };

  const [contentHeight, setContentHeight] = useState<number | undefined>(
    undefined,
  );

  return (
    <View style={{ flex: 1 }}>
      <NativeBottomSheet
        isOpen={isOpen}
        onClosed={handleClose}
        height={contentHeight}
      >
        <ScrollView
          onContentSizeChange={(_w, h) => {
            // iOS only: drives SwiftUI presentationDetents.
            // On Android this setState re-renders the Compose RNHostView
            // and steals TextInput focus / kills the keyboard.
            if (Platform.OS !== "ios") return;
            const next = h + 40;
            setContentHeight((prev) => (prev === next ? prev : next));
          }}
          style={{ backgroundColor: Colors.background }}
          contentContainerStyle={{
            padding: Spacing.xl,
            gap: Spacing.xl,
          }}
          showsVerticalScrollIndicator={false}
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

          {/* Goal picker — only shown when creating (not editing) */}
          {!editHabit && goals.length > 0 && (
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
                Goal
              </Body>

              {goals.length === 1 ? (
                /* Single goal — show as a chip, not a picker */
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: Spacing.sm,
                    paddingVertical: Spacing.sm,
                    paddingHorizontal: Spacing.md,
                    borderRadius: Radii.xl,
                    borderWidth: 1,
                    borderColor: goals[0].color ?? GOAL_COLORS[0],
                    backgroundColor: (goals[0].color ?? GOAL_COLORS[0]) + "1A",
                    alignSelf: "flex-start",
                  }}
                >
                  <Body style={{ fontSize: 16 }}>{goals[0].emoji ?? "🎯"}</Body>
                  <Body size="sm" weight="medium">
                    {goals[0].title}
                  </Body>
                </View>
              ) : (
                /* Multiple goals — horizontal scrollable chips */
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: Spacing.sm }}
                >
                  {goals.map((goal) => {
                    const isSelected = selectedGoalId === goal.id;
                    const color = goal.color ?? GOAL_COLORS[0];
                    return (
                      <Pressable
                        key={goal.id}
                        onPress={() => setSelectedGoalId(goal.id)}
                        style={({ pressed }) => ({
                          flexDirection: "row",
                          alignItems: "center",
                          gap: Spacing.xs,
                          paddingVertical: Spacing.sm,
                          paddingHorizontal: Spacing.md,
                          borderRadius: Radii.xl,
                          borderWidth: 1.5,
                          borderColor: isSelected ? color : Colors.border,
                          backgroundColor: isSelected
                            ? color + "22"
                            : Colors.transparent,
                          opacity: pressed ? 0.75 : 1,
                        })}
                      >
                        <Body style={{ fontSize: 16 }}>
                          {goal.emoji ?? "🎯"}
                        </Body>
                        <Body
                          size="sm"
                          weight={isSelected ? "medium" : "regular"}
                          style={{
                            color: isSelected
                              ? Colors.textPrimary
                              : Colors.textSecondary,
                          }}
                        >
                          {goal.title}
                        </Body>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          )}

          {/* Input */}
          <View>
            <NativeTextInput
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
              <Body
                size="sm"
                style={{ color: Colors.danger, marginTop: Spacing.xs }}
              >
                {titleError}
              </Body>
            ) : null}
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
                    borderColor:
                      habitType === "boolean" ? Colors.accent : Colors.border,
                    backgroundColor:
                      habitType === "boolean"
                        ? Colors.accent
                        : Colors.transparent,
                    alignItems: "center",
                  } satisfies ViewStyle
                }
              >
                <Body
                  size="sm"
                  style={{
                    color:
                      habitType === "boolean"
                        ? Colors.white
                        : Colors.textPrimary,
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
                      habitType === "quantitative"
                        ? Colors.accent
                        : Colors.border,
                    backgroundColor:
                      habitType === "quantitative"
                        ? Colors.accent
                        : Colors.transparent,
                    alignItems: "center",
                  } satisfies ViewStyle
                }
              >
                <Body
                  size="sm"
                  style={{
                    color:
                      habitType === "quantitative"
                        ? Colors.white
                        : Colors.textPrimary,
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
                  <NativeTextInput
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
                  <NativeTextInput
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

          {/* Reminders */}
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
              Reminders
            </Body>

            {reminderTimes.length > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: Spacing.sm,
                }}
              >
                {reminderTimes.map((timeStr) => (
                  <View
                    key={timeStr}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: Spacing.xs,
                      backgroundColor: accentColor + "1A",
                      borderColor: accentColor + "40",
                      borderWidth: 1,
                      paddingVertical: Spacing.xs,
                      paddingHorizontal: Spacing.sm,
                      borderRadius: Radii.md,
                    }}
                  >
                    <Body style={{ color: Colors.accent }} weight="medium">
                      {timeStr}
                    </Body>
                    <Pressable
                      onPress={() =>
                        setReminderTimes(
                          reminderTimes.filter((t) => t !== timeStr),
                        )
                      }
                      hitSlop={10}
                    >
                      <Body style={{ color: Colors.danger, marginLeft: 4 }}>
                        ✕
                      </Body>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            <Button
              title="+ Add Reminder Time"
              variant="outlined"
              onPress={() => {
                setPickerDate(new Date());
                setShowPicker(true);
              }}
            />

            {showPicker && (
              <View
                style={{
                  alignItems: "center",
                  paddingVertical: Spacing.md,
                  gap: Spacing.md,
                }}
              >
                <TimePicker
                  value={pickerDate}
                  variant={process.env.EXPO_OS === "ios" ? "inline" : "dialog"}
                  onTimeSelected={(date) => {
                    setTimeout(() => {
                      const hh = String(date.getHours()).padStart(2, "0");
                      const mm = String(date.getMinutes()).padStart(2, "0");
                      const timeStr = `${hh}:${mm}`;
                      if (!reminderTimes.includes(timeStr)) {
                        setReminderTimes((prev) => [...prev, timeStr].sort());
                      }
                      if (process.env.EXPO_OS !== "ios") {
                        setShowPicker(false);
                      }
                    }, 0);
                  }}
                  onDismiss={() => setTimeout(() => setShowPicker(false), 0)}
                />
                {process.env.EXPO_OS === "ios" && (
                  <Button
                    title="Save Time"
                    onPress={() => {
                      const hh = String(pickerDate.getHours()).padStart(2, "0");
                      const mm = String(pickerDate.getMinutes()).padStart(
                        2,
                        "0",
                      );
                      const timeStr = `${hh}:${mm}`;
                      if (!reminderTimes.includes(timeStr)) {
                        setReminderTimes([...reminderTimes, timeStr].sort());
                      }
                      setShowPicker(false);
                    }}
                  />
                )}
              </View>
            )}
          </View>

          <Button
            title={editHabit ? "Save Changes" : "Create Habit"}
            onPress={handleSave}
            size="lg"
            fullWidth
          />
        </ScrollView>
      </NativeBottomSheet>

      <ConfirmDialog
        visible={noGoalVisible}
        title="No Goal Yet"
        message="Create a goal first, then add habits to it."
        confirmLabel="OK"
        onConfirm={() => {}}
        onDismiss={() => setNoGoalVisible(false)}
      />
    </View>
  );
}
