/**
 * Settings screen — user preferences, notifications, data management.
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TextInput } from "@/components/ui/text-input";
import { Body, Heading } from "@/components/ui/typography";
import { useAppColors } from "@/hooks/use-app-colors";
import { Spacing } from "@/constants/theme";
import { useStorage } from "@/hooks/use-storage";
import {
	cancelAllReminders,
	requestNotificationPermissions,
} from "@/utils/notifications";
import React, { useState } from "react";
import { Switch, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function SettingsScreen() {
	const Colors = useAppColors();
	const [userName, setUserName] = useStorage("userName", "");
	const [remindersEnabled, setRemindersEnabled] = useStorage(
		"remindersEnabled",
		false,
	);

	const [permDialogVisible, setPermDialogVisible] = useState(false);
	const [resetDialogVisible, setResetDialogVisible] = useState(false);

	const handleToggleReminders = async (value: boolean) => {
		if (value) {
			const granted = await requestNotificationPermissions();
			if (!granted) {
				setPermDialogVisible(true);
				return;
			}
		} else {
			await cancelAllReminders();
		}
		setRemindersEnabled(value);
	};

	return (
		<KeyboardAwareScrollView
			contentInsetAdjustmentBehavior="automatic"
			contentContainerStyle={{
				padding: Spacing.xl,
				paddingBottom: Spacing.xxxl * 2,
				paddingTop: Spacing.xxxl,
				gap: Spacing.xl,
			}}
			style={{ backgroundColor: Colors.background }}
		>
			{/* Header */}
			<Animated.View entering={FadeInDown.duration(400)}>
				<Heading size="xl">Settings</Heading>
				<Body secondary style={{ marginTop: Spacing.xs }}>
					Manage your preferences and data.
				</Body>
			</Animated.View>

			{/* Profile Section */}
			<Animated.View entering={FadeInDown.duration(400).delay(100)}>
				<Card variant="filled" padding="lg">
					<View style={{ gap: Spacing.lg }}>
						<Body
							weight="bold"
							size="sm"
							style={{
								textTransform: "uppercase",
								letterSpacing: 1,
								color: Colors.textSecondary,
							}}
						>
							Profile
						</Body>
						<TextInput
							label="Your Name"
							value={userName}
							onChangeText={setUserName}
							placeholder="Enter your name"
						/>
					</View>
				</Card>
			</Animated.View>

			{/* Notifications Section */}
			<Animated.View entering={FadeInDown.duration(400).delay(100)}>
				<Card variant="filled" padding="lg">
					<View style={{ gap: Spacing.lg }}>
						<Body
							weight="bold"
							size="sm"
							style={{
								textTransform: "uppercase",
								letterSpacing: 1,
								color: Colors.textSecondary,
							}}
						>
							Notifications
						</Body>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<View style={{ flex: 1 }}>
								<Body weight="medium">Habit Reminders</Body>
								<Body size="sm" secondary>
									Get daily reminders for your habits
								</Body>
							</View>
							<Switch
								value={remindersEnabled}
								onValueChange={handleToggleReminders}
								trackColor={{ false: Colors.border, true: Colors.success }}
								thumbColor={Colors.white}
							/>
						</View>
					</View>
				</Card>
			</Animated.View>

			{/* About Section */}
			<Animated.View entering={FadeInDown.duration(400).delay(200)}>
				<Card variant="filled" padding="lg">
					<View style={{ gap: Spacing.md }}>
						<Body
							weight="bold"
							size="sm"
							style={{
								textTransform: "uppercase",
								letterSpacing: 1,
								color: Colors.textSecondary,
							}}
						>
							About
						</Body>
						<SettingsRow label="Version" value="1.0.0" />
						<SettingsRow label="Built with" value="Expo + React Native" />
					</View>
				</Card>
			</Animated.View>

			{/* Danger Zone */}
			<Animated.View entering={FadeInDown.duration(400).delay(300)}>
				<Card variant="bordered" padding="lg">
					<View style={{ gap: Spacing.lg }}>
						<Body
							weight="bold"
							size="sm"
							style={{
								textTransform: "uppercase",
								letterSpacing: 1,
								color: Colors.danger,
							}}
						>
							Danger Zone
						</Body>
						<Button
							title="Reset All Data"
							variant="outlined"
							onPress={() => setResetDialogVisible(true)}
						/>
					</View>
				</Card>
			</Animated.View>

			{/* Notice: notification permission denied */}
			<ConfirmDialog
				visible={permDialogVisible}
				title="Permissions Required"
				message="Please enable notifications in your device settings to receive habit reminders."
				confirmLabel="OK"
				onConfirm={() => {}}
				onDismiss={() => setPermDialogVisible(false)}
			/>

			{/* Confirm: reset all data */}
			<ConfirmDialog
				visible={resetDialogVisible}
				title="Reset All Data"
				message="This will permanently delete all your goals, habits, and progress. Are you sure?"
				confirmLabel="Delete"
				confirmDestructive
				onConfirm={() => {}}
				cancelLabel="Cancel"
				onDismiss={() => setResetDialogVisible(false)}
			/>
		</KeyboardAwareScrollView>
	);
}

function SettingsRow({ label, value }: { label: string; value: string }) {
	return (
		<View
			style={{
				flexDirection: "row",
				justifyContent: "space-between",
				alignItems: "center",
				paddingVertical: Spacing.xs,
			}}
		>
			<Body>{label}</Body>
			<Body secondary>{value}</Body>
		</View>
	);
}
