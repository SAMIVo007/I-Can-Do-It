/**
 * ConfirmDialog — generic confirmation/choice dialog.
 *
 * Default implementation (iOS / web): native React Native Alert
 * (real UIAlertController on iOS). The Android implementation
 * (confirm-dialog.android.tsx) uses Jetpack Compose's AlertDialog.
 *
 * Controlled via `visible`; call `onDismiss` to close.
 */

import { useEffect, useRef } from "react";
import { Alert, type AlertButton } from "react-native";

export interface ConfirmDialogProps {
	visible: boolean;
	title: string;
	message?: string;
	/** Primary (often destructive) action. */
	confirmLabel: string;
	onConfirm: () => void;
	confirmDestructive?: boolean;
	/** Optional middle action, e.g. "Move to Daily". */
	secondaryLabel?: string;
	onSecondary?: () => void;
	/** Optional cancel button. Omit for a single-button notice. */
	cancelLabel?: string;
	onDismiss: () => void;
}

export function ConfirmDialog({
	visible,
	title,
	message,
	confirmLabel,
	onConfirm,
	confirmDestructive,
	secondaryLabel,
	onSecondary,
	cancelLabel,
	onDismiss,
}: ConfirmDialogProps) {
	const shown = useRef(false);

	useEffect(() => {
		if (visible && !shown.current) {
			shown.current = true;

			const buttons: AlertButton[] = [];
			if (secondaryLabel) {
				buttons.push({
					text: secondaryLabel,
					onPress: () => {
						onSecondary?.();
						onDismiss();
					},
				});
			}
			buttons.push({
				text: confirmLabel,
				style: confirmDestructive ? "destructive" : "default",
				onPress: () => {
					onConfirm();
					onDismiss();
				},
			});
			if (cancelLabel) {
				buttons.push({ text: cancelLabel, style: "cancel", onPress: onDismiss });
			}

			Alert.alert(title, message, buttons, { onDismiss });
		}
		if (!visible) {
			shown.current = false;
		}
	}, [visible]);

	return null;
}
