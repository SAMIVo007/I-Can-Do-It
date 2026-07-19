import { useAppColors } from "@/hooks/use-app-colors";
import { useHabitStore } from "@/stores/habit-store";
import {
	AlertDialog,
	Text as AndroidText,
	DropdownMenu,
	DropdownMenuItem,
	Host,
	RNHostView,
	TextButton
} from "@expo/ui/jetpack-compose";
import { padding } from "@expo/ui/jetpack-compose/modifiers";
import * as Haptics from "expo-haptics";
import { triggerHaptic } from "@/utils/haptics";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Body } from "./typography";

export interface HabitMenuProps {
	habitId: string;
	children: React.ReactNode;
	isIcon?: boolean;
}

export function HabitMenu({ habitId, children, isIcon }: HabitMenuProps) {
	const Colors = useAppColors();
	const [expanded, setExpanded] = useState(false);
	const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
	const deleteHabit = useHabitStore((s) => s.deleteHabit);

	const confirmDelete = () => {
		deleteHabit(habitId);
		setDeleteAlertVisible(false);
		if (router.canGoBack()) {
			router.back();
		}
	};

	const handleDelete = () => {
		setDeleteAlertVisible(true);
	};

	return (
		<View>
			{/* RN Content handles its own touches without Compose interference */}
			{isIcon ? (
				<Pressable
					hitSlop={20}
					android_ripple={{ borderless: true, color: Colors.border, radius: 20, foreground: true }}
					onPress={() => {
						triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
						setExpanded(true);
					}}
				>
					{children}
				</Pressable>
			) : React.isValidElement(children) ? (
				React.cloneElement(children as React.ReactElement<any>, {
					onPress: () => router.push(`/habit/${habitId}` as any),
					onLongPress: () => {
						triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
						setExpanded(true);
					},
				})
			) : (
				<View>{children}</View>
			)}

			{/* Compose Host only while open — mounting matchContents Host during
			    screen enter + Reanimated layout crashes with
			    "performMeasureAndLayout called during measure layout". */}
			{(expanded || deleteAlertVisible) && (
			<View style={{ position: "absolute", top: 20, right: 20, width: 1, height: 1 }} pointerEvents="none">
				<Host matchContents>
					<DropdownMenu
						expanded={expanded}
						onDismissRequest={() => setExpanded(false)}
					>
						<DropdownMenu.Trigger>
							<AndroidText></AndroidText>
						</DropdownMenu.Trigger>

				<DropdownMenu.Items>
					<DropdownMenuItem
						modifiers={[
							padding(4, 0, 8, 0),        // Adds 16dp padding on all sides
						]}
						onClick={() => {
							setExpanded(false);
							router.push(`/add-habit?id=${habitId}` as any);
						}}
					>
						<DropdownMenuItem.LeadingIcon>
							<SymbolView
								name={{ ios: "square.and.pencil", android: "edit", web: "edit" }}
								size={22}
								tintColor={Colors.textPrimary}
								style={{ marginRight: 8 }}
								fallback={
									<Body style={{ color: Colors.textPrimary, fontSize: 18, marginRight: 8 }}>✕</Body>
								}
							/>
						</DropdownMenuItem.LeadingIcon>
						<DropdownMenuItem.Text>
							<AndroidText>Edit Habit</AndroidText>
						</DropdownMenuItem.Text>
					</DropdownMenuItem>

					<DropdownMenuItem
						modifiers={[
							padding(4, 0, 8, 0),        // Adds 16dp padding on all sides
						]}
						onClick={() => {
							setExpanded(false);
							handleDelete();
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
							<AndroidText color={Colors.danger as string}>Delete Habit</AndroidText>
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
			</View>
			)}
		</View>
	);
}
