/**
 * Android – Jetpack Compose TimePickerDialog from @expo/ui.
 */

import { Host, DateTimePicker as JCDateTimePicker, TimePickerDialog } from "@expo/ui/jetpack-compose";
import { useState } from "react";

export interface TimePickerProps {
	/** Currently selected date (hour/minute are read from it). */
	value: Date;
	/** Called when the user confirms a time. */
	onTimeSelected: (date: Date) => void;
	/** Called when the picker is dismissed without selection. */
	onDismiss: () => void;
	/** Whether to render inline or as a dialog. Defaults to "dialog". */
	variant?: "inline" | "dialog";
}

export function TimePicker({ value, onTimeSelected, onDismiss, variant = "dialog" }: TimePickerProps) {
	if (variant === "inline") {
		return (
			<Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
				<JCDateTimePicker
					displayedComponents="hourAndMinute"
					initialDate={value.toISOString()}
					variant="picker"
					onDateSelected={(date) => {
						onTimeSelected(date);
					}}
				/>
			</Host>
		);
	}

	// Dialog variant (default)
	return (
		<Host matchContents>
			<TimePickerDialog
				initialDate={value.toISOString()}
				onDateSelected={(date) => {
					onTimeSelected(date);
				}}
				onDismissRequest={onDismiss}
				confirmButtonLabel="OK"
				dismissButtonLabel="Cancel"
			/>
		</Host>
	);
}
