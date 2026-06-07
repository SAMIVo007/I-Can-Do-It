import React from "react";
import { View, Pressable } from "react-native";
import { Card } from "./card";
import { Body, Heading } from "./typography";
import { useAppColors } from "@/hooks/use-app-colors";
import { Spacing, Radii } from "@/constants/theme";

export function ProBanner() {
	const Colors = useAppColors();

	return (
		<Pressable
			onPress={() => {
				// Mock: show a toast or nothing
			}}
			style={({ pressed }) => ({
				opacity: pressed ? 0.9 : 1,
				transform: [{ scale: pressed ? 0.98 : 1 }],
			})}
		>
			<Card
				variant="filled"
				padding="lg"
				style={{
					// Using surface as a safe background, with a colored border to make it pop
					backgroundColor: Colors.surface,
					borderColor: Colors.success,
					borderWidth: 1,
				}}
			>
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						gap: Spacing.sm,
						marginBottom: Spacing.sm,
					}}
				>
					<Heading size="md">I Can Do It</Heading>
					<View
						style={{
							backgroundColor: Colors.success,
							paddingHorizontal: 8,
							paddingVertical: 4,
							borderRadius: Radii.full,
						}}
					>
						<Body
							size="xs"
							weight="bold"
							style={{ color: Colors.white, letterSpacing: 0.5 }}
						>
							PRO
						</Body>
					</View>
				</View>
				<Body secondary size="sm" style={{ lineHeight: 20 }}>
					Free users can create up to 3 habits. Remove the limit to add more.
				</Body>
				<Body
					size="sm"
					weight="bold"
					style={{ color: Colors.success, marginTop: Spacing.sm }}
				>
					Get I Can Do It PRO →
				</Body>
			</Card>
		</Pressable>
	);
}
