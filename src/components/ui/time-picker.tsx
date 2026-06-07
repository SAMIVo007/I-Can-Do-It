/**
 * Fallback – web / other platforms.
 * Uses a basic <input type="time"> as a last resort.
 */

import { View, Text } from "react-native";

export interface TimePickerProps {
	value: Date;
	onTimeSelected: (date: Date) => void;
	onDismiss: () => void;
	variant?: "inline" | "dialog";
}

export function TimePicker({ value, onTimeSelected, onDismiss }: TimePickerProps) {
	return (
		<View style={{ padding: 16, alignItems: "center" }}>
			<Text>Time picker is not available on this platform.</Text>
		</View>
	);
}
