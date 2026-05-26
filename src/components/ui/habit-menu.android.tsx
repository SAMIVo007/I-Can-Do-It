import { Colors } from "@/constants/theme";
import { useHabitStore } from "@/stores/habit-store";
import {
	AlertDialog,
	Text as AndroidText,
	DropdownMenu,
	DropdownMenuItem,
	Host,
	TextButton,
} from "@expo/ui/jetpack-compose";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { cloneElement, isValidElement, useState } from "react";
import { Pressable, View } from "react-native";

export interface HabitMenuProps {
	habitId: string;
	children: React.ReactNode;
	isIcon?: boolean;
}

export function HabitMenu({ habitId, children, isIcon }: HabitMenuProps) {
	const [expanded, setExpanded] = useState(false);
	const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
	const deleteHabit = useHabitStore((s) => s.deleteHabit);

	const confirmDelete = () => {
		deleteHabit(habitId);
		setDeleteAlertVisible(false);
		router.back();
	};

	const handleDelete = () => {
		setDeleteAlertVisible(true);
	};

	return (
		<Host matchContents>
			<DropdownMenu
				expanded={expanded}
				onDismissRequest={() => setExpanded(false)}
			>
				<DropdownMenu.Trigger>
					{isIcon ? (
						<Pressable
							onPress={() => {
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
								setExpanded(true);
							}}
						>
							<View pointerEvents="none">{children}</View>
						</Pressable>
					) : isValidElement(children) ? (
						cloneElement(children as React.ReactElement<any>, {
							onPress: () => router.push(`/habit/${habitId}` as any),
							onLongPress: () => {
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
								setExpanded(true);
							},
						})
					) : (
						children
					)}
				</DropdownMenu.Trigger>
				<DropdownMenu.Items>
					<DropdownMenuItem
						onClick={() => {
							setExpanded(false);
							router.push(`/add-habit?id=${habitId}` as any);
						}}
					>
						<DropdownMenuItem.Text>
							<AndroidText>Edit Habit</AndroidText>
						</DropdownMenuItem.Text>
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => {
							setExpanded(false);
							handleDelete();
						}}
					>
						<DropdownMenuItem.Text>
							<AndroidText>Delete Habit</AndroidText>
						</DropdownMenuItem.Text>
					</DropdownMenuItem>
				</DropdownMenu.Items>
			</DropdownMenu>

			{deleteAlertVisible && (
				<AlertDialog onDismissRequest={() => setDeleteAlertVisible(false)}>
					<AlertDialog.Title>
						<AndroidText>Delete Habit</AndroidText>
					</AlertDialog.Title>
					<AlertDialog.Text>
						<AndroidText>
							Are you sure you want to delete this habit? This cannot be undone.
						</AndroidText>
					</AlertDialog.Text>
					<AlertDialog.ConfirmButton>
						<TextButton onClick={confirmDelete}>
							<AndroidText>Delete</AndroidText>
						</TextButton>
					</AlertDialog.ConfirmButton>
					<AlertDialog.DismissButton>
						<TextButton onClick={() => setDeleteAlertVisible(false)}>
							<AndroidText>Cancel</AndroidText>
						</TextButton>
					</AlertDialog.DismissButton>
				</AlertDialog>
			)}
		</Host>
	);
}
