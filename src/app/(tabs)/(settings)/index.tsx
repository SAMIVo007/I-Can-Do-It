/**
 * Settings screen — user preferences, notifications, data management.
 */

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Body, Heading } from "@/components/ui/typography";
import { useAppColors } from "@/hooks/use-app-colors";
import { Fonts, Spacing } from "@/constants/theme";
import { useStorage } from "@/hooks/use-storage";
import {
	cancelAllReminders,
	requestNotificationPermissions,
} from "@/utils/notifications";
import React, { useState } from "react";
import { View, TextInput as RNTextInput } from "react-native";
import { Switch as ExpoSwitch, Host } from "@expo/ui";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { FadeInDown } from "react-native-reanimated";

// New UI Components
import { SettingsGroup, SettingsRow, SettingsChevron } from "@/components/ui/settings-list";
import { ProBanner } from "@/components/ui/pro-banner";

export default function SettingsScreen() {
	const Colors = useAppColors();
	
	// State
	const [userName, setUserName] = useStorage("userName", "");
	const [remindersEnabled, setRemindersEnabled] = useStorage("remindersEnabled", false);
	const [hapticsEnabled, setHapticsEnabled] = useStorage("hapticsEnabled", true);
	
	const [appTheme, setAppTheme] = useStorage<"system" | "light" | "dark">("appTheme", "system");
	
	// Dialogs
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

	const handleThemeCycle = () => {
		const themes: ("system" | "light" | "dark")[] = ["system", "light", "dark"];
		const nextIndex = (themes.indexOf(appTheme) + 1) % themes.length;
		setAppTheme(themes[nextIndex]);
	};

	return (
		<KeyboardAwareScrollView
			contentInsetAdjustmentBehavior="automatic"
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{
				padding: Spacing.xl,
				paddingBottom: Spacing.xxxl * 2,
				paddingTop: Spacing.xxxl,
				gap: Spacing.xxl, // Larger gap between distinct groups
			}}
			style={{ backgroundColor: Colors.background }}
		>
			{/* Header */}
			<Animated.View entering={FadeInDown.duration(400)}>
				<Heading size="xl" style={{ textAlign: "center", marginBottom: Spacing.sm }}>Settings</Heading>
			</Animated.View>

			{/* PRO Banner */}
			{/* <Animated.View entering={FadeInDown.duration(400).delay(100)}>
				<ProBanner />
			</Animated.View> */}

			{/* Profile Section */}
			<Animated.View entering={FadeInDown.duration(400).delay(150)}>
				<SettingsGroup label="Profile">
					<SettingsRow
						label="Your Name"
						icon={{ ios: "person", android: "person", web: "person" }}
						trailing={
							<RNTextInput
								value={userName}
								onChangeText={setUserName}
								placeholder="Enter your name"
								placeholderTextColor={Colors.textSecondary}
								style={{
									fontFamily: Fonts.utilityMedium,
									fontSize: 16,
									color: Colors.textSecondary,
									textAlign: "right",
									minWidth: 120,
								}}
							/>
						}
					/>
				</SettingsGroup>
			</Animated.View>

			{/* App Settings Section */}
			<Animated.View entering={FadeInDown.duration(400).delay(200)}>
				<SettingsGroup label="App Settings">
					<SettingsRow
						label="Theme"
						icon={{ ios: "moon", android: "dark_mode", web: "dark_mode" }}
						onPress={handleThemeCycle}
						trailing={
							<View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.xs }}>
								<Body secondary style={{ textTransform: "capitalize" }}>{appTheme}</Body>
								<SettingsChevron />
							</View>
						}
					/>
					{/* <SettingsRow
						label="Font Style"
						icon={{ ios: "textformat", android: "title", web: "title" }}
						onPress={() => {}} // Mock
						trailing={
							<View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.xs }}>
								<Body secondary>Newsreader</Body>
								<SettingsChevron />
							</View>
						}
					/> */}
					<SettingsRow
						label="Haptic Feedback"
						icon={{ ios: "hand.tap", android: "touch_app", web: "touch_app" }}
						trailing={
							<Host matchContents>
								<ExpoSwitch
									value={hapticsEnabled}
									onValueChange={setHapticsEnabled}
								/>
							</Host>
						}
					/>
					<SettingsRow
						label="Habit Reminders"
						icon={{ ios: "bell", android: "notifications", web: "notifications" }}
						trailing={
							<Host matchContents>
								<ExpoSwitch
									value={remindersEnabled}
									onValueChange={handleToggleReminders}
								/>
							</Host>
						}
					/>
					<SettingsRow
						label="Language"
						icon={{ ios: "globe", android: "language", web: "language" }}
						onPress={() => {}} // Mock
						trailing={
							<View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.xs }}>
								<Body secondary>English</Body>
								<SettingsChevron />
							</View>
						}
					/>
				</SettingsGroup>
			</Animated.View>

			{/* More Section */}
			<Animated.View entering={FadeInDown.duration(400).delay(250)}>
				<SettingsGroup label="More">
					<SettingsRow
						label="Send Feedback"
						icon={{ ios: "paperplane", android: "send", web: "send" }}
						onPress={() => {}} // Mock
						trailing={<SettingsChevron />}
					/>
					<SettingsRow
						label="Reset All Data"
						icon={{ ios: "trash", android: "delete", web: "delete" }}
						destructive
						onPress={() => setResetDialogVisible(true)}
					/>
				</SettingsGroup>
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
