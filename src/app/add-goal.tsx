/**
 * Add / Edit Goal — bottom-sheet modal.
 * Route params:
 *   id?  — when present, enters edit mode for that goal
 */

import { Button } from "@/components/ui/button";
import {
  BottomSheetScrollView,
  NativeBottomSheet,
} from "@/components/ui/native-bottom-sheet";
import { NativeTextInput } from "@/components/ui/native-text-input";
import { Body, Heading } from "@/components/ui/typography";
import { Radii, Spacing } from "@/constants/theme";
import { useAppColors } from "@/hooks/use-app-colors";
import { useHabitStore } from "@/stores/habit-store";
import type { HabitCategory } from "@/types/models";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Pressable, View, type ViewStyle } from "react-native";

// ─── Constants ──────────────────────────────────────────────────

const FOCUS_AREAS: HabitCategory[] = [
  "Health",
  "Fitness",
  "Learning",
  "Mindfulness",
  "Finance",
  "Creative",
];

const EMOJI_OPTIONS = [
  "💪",
  "🧠",
  "📚",
  "🏃",
  "💰",
  "🎨",
  "🧘",
  "❤️",
  "✈️",
  "🌱",
  "🎯",
  "⭐",
  "🍎",
  "💤",
  "🎵",
  "🔥",
];

// Muted accent colors that complement the Slate & Sage design system
export const GOAL_COLORS = [
  "#7BAE7F", // sage green
  "#5B8DB8", // slate blue
  "#C4837A", // dusty rose
  "#D4956A", // warm amber
  "#8E7DB5", // lavender
  "#8A9A5B", // olive
  "#6B9E9E", // teal
  "#C47A5B", // terracotta
];

// ─── Component ──────────────────────────────────────────────────

export default function AddGoalScreen() {
  const Colors = useAppColors();
  const { id: editId } = useLocalSearchParams<{ id?: string }>();

  const goals = useHabitStore((s) => s.goals);
  const addGoal = useHabitStore((s) => s.addGoal);
  const updateGoal = useHabitStore((s) => s.updateGoal);

  const editGoal = editId ? goals.find((g) => g.id === editId) : undefined;
  const isEdit = Boolean(editGoal);

  const [title, setTitle] = useState(editGoal?.title ?? "");
  const [focusArea, setFocusArea] = useState<HabitCategory>(
    editGoal?.focusArea ?? "Health",
  );
  const [selectedEmoji, setSelectedEmoji] = useState<string>(
    editGoal?.emoji ?? "🎯",
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    editGoal?.color ?? GOAL_COLORS[0],
  );
  const [titleError, setTitleError] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const handleSave = async () => {
    if (!title.trim()) {
      setTitleError("Please give your goal a name.");
      return;
    }
    setTitleError("");

    if (isEdit && editGoal) {
      await updateGoal(editGoal.id, {
        title: title.trim(),
        focusArea,
        emoji: selectedEmoji,
        color: selectedColor,
      });
    } else {
      await addGoal(title.trim(), focusArea, selectedEmoji, selectedColor);
    }
    setIsOpen(false);
  };

  const handleClose = () => router.back();

  return (
    <View style={{ flex: 1 }}>
      <NativeBottomSheet isOpen={isOpen} onClosed={handleClose}>
        <BottomSheetScrollView
          contentContainerStyle={{
            padding: Spacing.xl,
            gap: Spacing.xl,
            backgroundColor: Colors.background,
          }}
        >
          {/* Header */}
          <Heading>{isEdit ? "Edit Goal" : "New Goal"}</Heading>

          {/* Emoji + Color Row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: Spacing.xl,
            }}
          >
            {/* Selected emoji preview */}
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: Radii.lg,
                backgroundColor: selectedColor + "33", // 20% opacity tint
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: selectedColor,
              }}
            >
              <Body style={{ fontSize: 32 }}>{selectedEmoji}</Body>
            </View>

            {/* Color swatches */}
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                flexWrap: "wrap",
                gap: Spacing.sm,
              }}
            >
              {GOAL_COLORS.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: color,
                    borderWidth: selectedColor === color ? 2.5 : 0,
                    borderColor: Colors.accent,
                    // Ring effect when selected
                    shadowColor:
                      selectedColor === color ? color : "transparent",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: selectedColor === color ? 0.8 : 0,
                    shadowRadius: 4,
                    elevation: selectedColor === color ? 4 : 0,
                  }}
                />
              ))}
            </View>
          </View>

          {/* Emoji grid */}
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
              Icon
            </Body>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: Spacing.sm,
              }}
            >
              {EMOJI_OPTIONS.map((emoji) => (
                <Pressable
                  key={emoji}
                  onPress={() => setSelectedEmoji(emoji)}
                  style={({ pressed }) => ({
                    width: 44,
                    height: 44,
                    borderRadius: Radii.md,
                    backgroundColor:
                      selectedEmoji === emoji
                        ? selectedColor + "33"
                        : Colors.surface,
                    borderWidth: 1.5,
                    borderColor:
                      selectedEmoji === emoji ? selectedColor : Colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Body style={{ fontSize: 22 }}>{emoji}</Body>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Goal title */}
          <View>
            <NativeTextInput
              label="Goal Name"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (titleError) setTitleError("");
              }}
              placeholder="e.g., Get Fit, Learn Guitar, Save $10k"
              autoFocus={!isEdit}
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

          {/* Focus area */}
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
              Focus Area
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
              {FOCUS_AREAS.map((area) => (
                <Pressable
                  key={area}
                  onPress={() => setFocusArea(area)}
                  style={({ pressed }) => ({
                    paddingVertical: Spacing.sm,
                    paddingHorizontal: Spacing.md,
                    borderRadius: Radii.xl,
                    borderWidth: 1,
                    borderColor:
                      focusArea === area ? selectedColor : Colors.border,
                    backgroundColor:
                      focusArea === area ? selectedColor : Colors.transparent,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Body
                    size="sm"
                    style={{
                      color:
                        focusArea === area ? Colors.white : Colors.textPrimary,
                    }}
                  >
                    {area}
                  </Body>
                </Pressable>
              ))}
            </View>
          </View>

          <Button
            title={isEdit ? "Save Changes" : "Create Goal"}
            onPress={handleSave}
            size="lg"
            fullWidth
          />
        </BottomSheetScrollView>
      </NativeBottomSheet>
    </View>
  );
}
