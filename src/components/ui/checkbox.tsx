/**
 * Checkbox — circular, fills flat Sage Green on completion.
 * Animated with Reanimated v4.
 */

import { useAppColors } from "@/hooks/use-app-colors";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Pressable, type ViewStyle } from "react-native";
import Animated, {
	FadeIn,
	useAnimatedStyle,
	withTiming,
} from "react-native-reanimated";
import { Body } from "./typography";

interface CheckboxProps {
	checked: boolean;
	onToggle: () => void;
	size?: number;
}

export function Checkbox({ checked, onToggle, size = 30 }: CheckboxProps) {
	const Colors = useAppColors();
	const overlayStyle = useAnimatedStyle(() => ({
		opacity: withTiming(checked ? 1 : 0, { duration: 200 }),
	}));

	return (
		<Pressable onPress={onToggle} hitSlop={8}>
			<Animated.View
				style={{
					width: size,
					height: size,
					borderRadius: size / 2,
					borderWidth: 2,
					alignItems: "center",
					justifyContent: "center",
					borderColor: Colors.border as any, // Base border color
				}}
			>
				{/* Animated success background and border overlay */}
				<Animated.View
					style={[
						{
							position: "absolute",
							top: -2, // Offset border width
							left: -2,
							right: -2,
							bottom: -2,
							borderRadius: size / 2,
							backgroundColor: Colors.success as any,
							borderColor: Colors.success as any,
							borderWidth: 2,
						},
						overlayStyle,
					]}
				/>

				{checked && (
					<Animated.View entering={FadeIn.duration(150)}>
						<SymbolView
							name={{ ios: "checkmark", android: "check", web: "check" }}
							size={20}
							tintColor={Colors.white as any}
							fallback={<Body style={{ color: Colors.white as any, fontSize: 18 }}>✓</Body>}
						/>
					</Animated.View>
				)}
			</Animated.View>
		</Pressable>
	);
}
