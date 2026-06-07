/**
 * iOS – SwiftUI DatePicker (hourAndMinute) from @expo/ui.
 */

import { Host, DatePicker } from "@expo/ui/swift-ui";
import { datePickerStyle } from "@expo/ui/swift-ui/modifiers";

export interface TimePickerProps {
	/** Currently selected date (hour/minute are read from it). */
	value: Date;
	/** Called when the user confirms a time. */
	onTimeSelected: (date: Date) => void;
	/** Called when the picker is dismissed without selection. */
	onDismiss: () => void;
	/** Whether to render inline or as a dialog. On iOS "dialog" falls back to inline wheel. */
	variant?: "inline" | "dialog";
}

export function TimePicker({ value, onTimeSelected }: TimePickerProps) {
	return (
		<Host matchContents>
			<DatePicker
				modifiers={[datePickerStyle("wheel")]}
				title="Select a time"
				selection={value}
				displayedComponents={["hourAndMinute"]}
				onDateChange={(date) => {
					onTimeSelected(date);
				}}
			/>
		</Host>
	);
}
