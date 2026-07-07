import React, { ReactNode } from "react";
import { View, Pressable, type ViewStyle } from "react-native";
import { Body } from "./typography";
import { useAppColors } from "@/hooks/use-app-colors";
import { Spacing, Radii } from "@/constants/theme";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Card } from "./card";

interface SettingsGroupProps {
	label?: string;
	children: ReactNode;
}

export function SettingsGroup({ label, children }: SettingsGroupProps) {
	const Colors = useAppColors();

	return (
		<View style={{ gap: Spacing.sm }}>
			{label && (
				<Body
					size="sm"
					weight="bold"
					style={{
						color: Colors.textSecondary,
						textTransform: "uppercase",
						letterSpacing: 1,
						marginLeft: Spacing.sm,
					}}
				>
					{label}
				</Body>
			)}
			<View style={{ gap: 2 }}>
				{React.Children.map(children, (child, index) => {
					if (!React.isValidElement(child)) return null;
					const total = React.Children.count(children);
					let position: "first" | "middle" | "last" | "only" = "middle";
					if (total === 1) position = "only";
					else if (index === 0) position = "first";
					else if (index === total - 1) position = "last";

					return React.cloneElement(child as React.ReactElement<any>, { position });
				})}
			</View>
		</View>
	);
}

interface SettingsRowProps {
	label: string;
	icon?: SymbolViewProps["name"];
	iconColor?: string;
	trailing?: ReactNode;
	onPress?: () => void;
	destructive?: boolean;
	position?: "first" | "middle" | "last" | "only";
}

export function SettingsRow({
	label,
	icon,
	iconColor,
	trailing,
	onPress,
	destructive,
	position = "only",
}: SettingsRowProps) {
	const Colors = useAppColors();
	const finalIconColor = iconColor || (destructive ? Colors.danger : Colors.textSecondary);
	const finalTextColor = destructive ? Colors.danger : Colors.textPrimary;

	const isFirst = position === "first" || position === "only";
	const isLast = position === "last" || position === "only";

	const content = (
		<Card
			variant="filled"
			padding="none"
			style={{
				borderTopLeftRadius: isFirst ? Radii.lg : 4,
				borderTopRightRadius: isFirst ? Radii.lg : 4,
				borderBottomLeftRadius: isLast ? Radii.lg : 4,
				borderBottomRightRadius: isLast ? Radii.lg : 4,
			}}
		>
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					paddingHorizontal: Spacing.lg,
					height: 56,
					gap: Spacing.md,
				}}
			>
				{icon && (
					<SymbolView
						name={icon}
						size={22}
						tintColor={finalIconColor as any}
						fallback={
							<Body style={{ color: finalIconColor as any, fontSize: 18 }}>•</Body>
						}
					/>
				)}
				<Body style={{ color: finalTextColor as any, flex: 1 }} weight="medium">
					{label}
				</Body>
				{trailing && <View>{trailing}</View>}
			</View>
		</Card>
	);

	if (onPress) {
		return (
			<Pressable
				onPress={onPress}
				style={({ pressed }) => ({
					opacity: pressed ? 0.9 : 1,
					transform: [{ scale: pressed ? 0.98 : 1 }],
				})}
			>
				{content}
			</Pressable>
		);
	}

	return content;
}

export function SettingsChevron() {
	const Colors = useAppColors();
	return (
		<SymbolView
			name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
			size={20}
			tintColor={Colors.textSecondary as any}
			fallback={<Body secondary>{">"}</Body>}
		/>
	);
}
