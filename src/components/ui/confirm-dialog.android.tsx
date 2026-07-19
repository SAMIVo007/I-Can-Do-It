/**
 * ConfirmDialog (Android) — Jetpack Compose AlertDialog.
 *
 * Mirrors the cross-platform API in confirm-dialog.tsx. Renders a native
 * Material AlertDialog instead of React Native's Alert.
 */

import { useAppColors, useResolvedColorScheme } from "@/hooks/use-app-colors";
import {
	AlertDialog,
	Text as AndroidText,
	Column,
	Host,
	TextButton,
} from "@expo/ui/jetpack-compose";
import type { ConfirmDialogProps } from "./confirm-dialog";

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
	const Colors = useAppColors();
	const colorScheme = useResolvedColorScheme();
	if (!visible) return null;

	return (
		<Host matchContents colorScheme={colorScheme}>
			<AlertDialog onDismissRequest={onDismiss}>
				<AlertDialog.Title>
					<AndroidText>{title}</AndroidText>
				</AlertDialog.Title>

				{message ? (
					<AlertDialog.Text>
						<AndroidText>{message}</AndroidText>
					</AlertDialog.Text>
				) : null}

				<AlertDialog.ConfirmButton>
					<Column>
						{secondaryLabel ? (
							<TextButton
								onClick={() => {
									onSecondary?.();
									onDismiss();
								}}
							>
								<AndroidText>{secondaryLabel}</AndroidText>
							</TextButton>
						) : null}
						<TextButton
							onClick={() => {
								onConfirm();
								onDismiss();
							}}
						>
							<AndroidText color={confirmDestructive ? (Colors.danger as string) : undefined}>
								{confirmLabel}
							</AndroidText>
						</TextButton>
					</Column>
				</AlertDialog.ConfirmButton>

				{cancelLabel ? (
					<AlertDialog.DismissButton>
						<TextButton onClick={onDismiss}>
							<AndroidText>{cancelLabel}</AndroidText>
						</TextButton>
					</AlertDialog.DismissButton>
				) : null}
			</AlertDialog>
		</Host>
	);
}
