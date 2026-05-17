/**
 * Checkbox — circular, fills flat Sage Green on completion.
 * Animated with Reanimated v4.
 */

import { Colors } from "@/constants/theme";
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
	const animatedStyle = useAnimatedStyle(() => ({
		backgroundColor: withTiming(checked ? Colors.success : "transparent", {
			duration: 200,
		}),
		borderColor: withTiming(checked ? Colors.success : Colors.border, {
			duration: 200,
		}),
	}));

	return (
		<Pressable onPress={onToggle} hitSlop={8}>
			<Animated.View
				style={[
					{
						width: size,
						height: size,
						borderRadius: size / 2,
						borderWidth: 2,
						alignItems: "center",
						justifyContent: "center",
					} satisfies ViewStyle,
					animatedStyle,
				]}
			>
				{checked && (
					<Animated.View entering={FadeIn.duration(150)}>
						<SymbolView
							name={{ ios: "checkmark", android: "check", web: "check" }}
							size={20}
							tintColor={Colors.white}
							fallback={<Body style={{ color: Colors.white, fontSize: 18 }}>✓</Body>}
						/>
					</Animated.View>
				)}
			</Animated.View>
		</Pressable>
	);
}
