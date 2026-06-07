import { Colors } from "@/constants/theme";
import { useHabitStore } from "@/stores/habit-store";
import {
	Text as AndroidText,
	DropdownMenu,
	DropdownMenuItem,
	Host,
	RNHostView,
} from "@expo/ui/jetpack-compose";
import { padding } from "@expo/ui/jetpack-compose/modifiers";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import React, { cloneElement, isValidElement, useState } from "react";
import { Pressable, View } from "react-native";
import { Body } from "./typography";
import { ConfirmDialog } from "./confirm-dialog";

export interface GoalMenuProps {
	goalId: string;
	children: React.ReactNode;
	isIcon?: boolean;
}

export function GoalMenu({ goalId, children, isIcon }: GoalMenuProps) {
	const [expanded, setExpanded] = useState(false);
	const [dialogVisible, setDialogVisible] = useState(false);
	const deleteGoal = useHabitStore((s) => s.deleteGoal);
	const goal = useHabitStore((s) => s.goals.find((g) => g.id === goalId));
	const habitCount = useHabitStore(
		(s) => s.habits.filter((h) => h.goalId === goalId && h.isActive).length
	);

	const handleCascade = async () => {
		await deleteGoal(goalId, "cascade");
		router.back();
	};
	const handleMove = async () => {
		await deleteGoal(goalId, "reassign");
		router.back();
	};

	return (
		<>
		<Host matchContents>
			<DropdownMenu
				expanded={expanded}
				onDismissRequest={() => setExpanded(false)}
			>
				<DropdownMenu.Trigger>
					<RNHostView matchContents>
						{isIcon ? (
							<Pressable
								hitSlop={20}
								android_ripple={{ borderless: true, color: Colors.border, radius: 20, foreground: true }}
								onPress={() => {
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
									setExpanded(true);
								}}
							>
								{children}
							</Pressable>
						) : isValidElement(children) ? (
							cloneElement(children as React.ReactElement<any>, {
								onPress: () => router.push(`/goal/${goalId}` as any),
								onLongPress: () => {
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
									setExpanded(true);
								},
							})
						) : (
							<View>{children}</View>
						)}
					</RNHostView>
				</DropdownMenu.Trigger>

				<DropdownMenu.Items>
					<DropdownMenuItem
						modifiers={[padding(4, 0, 8, 0)]}
						onClick={() => {
							setExpanded(false);
							router.push(`/add-goal?id=${goalId}` as any);
						}}
					>
						<DropdownMenuItem.LeadingIcon>
							<SymbolView
								name={{ ios: "square.and.pencil", android: "edit", web: "edit" }}
								size={22}
								tintColor={Colors.textPrimary}
								style={{ marginRight: 8 }}
								fallback={
									<Body style={{ color: Colors.textPrimary, fontSize: 18, marginRight: 8 }}>✎</Body>
								}
							/>
						</DropdownMenuItem.LeadingIcon>
						<DropdownMenuItem.Text>
							<AndroidText>Edit Goal</AndroidText>
						</DropdownMenuItem.Text>
					</DropdownMenuItem>

					<DropdownMenuItem
						modifiers={[padding(4, 0, 8, 0)]}
						onClick={() => {
							setExpanded(false);
							setDialogVisible(true);
						}}
						elementColors={{
							textColor: Colors.danger,
							leadingIconColor: Colors.danger,
						}}
					>
						<DropdownMenuItem.LeadingIcon>
							<SymbolView
								name={{ ios: "xmark.bin", android: "delete_forever", web: "delete_forever" }}
								size={22}
								tintColor={Colors.danger}
								style={{ marginRight: 8 }}
								fallback={
									<Body style={{ color: Colors.danger, fontSize: 18, marginRight: 8 }}>✕</Body>
								}
							/>
						</DropdownMenuItem.LeadingIcon>
						<DropdownMenuItem.Text>
							<AndroidText color={Colors.danger as string}>Delete Goal</AndroidText>
						</DropdownMenuItem.Text>
					</DropdownMenuItem>
				</DropdownMenu.Items>
			</DropdownMenu>
		</Host>

		<ConfirmDialog
			visible={dialogVisible}
			title={`Delete "${goal?.title ?? "this goal"}"?`}
			message={
				habitCount > 0
					? `This goal has ${habitCount} habit${habitCount !== 1 ? "s" : ""} with their streaks and history. Choose what to do with them.`
					: "This goal will be permanently deleted."
			}
			confirmLabel={habitCount > 0 ? "Delete habits too" : "Delete"}
			confirmDestructive
			onConfirm={handleCascade}
			secondaryLabel={habitCount > 0 ? "Move to Daily" : undefined}
			onSecondary={habitCount > 0 ? handleMove : undefined}
			cancelLabel="Cancel"
			onDismiss={() => setDialogVisible(false)}
		/>
		</>
	);
}
