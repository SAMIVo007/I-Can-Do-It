import { Body } from "@/components/ui/typography";
import { Fonts, Spacing } from "@/constants/theme";
import { useAppColors } from "@/hooks/use-app-colors";
import { useTheme } from "expo-router";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Platform, Pressable, View } from "react-native";
import Animated, {
	SharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FABProps {
	onPress: () => void;
	isExpanded: SharedValue<number>;
	/** Label shown when expanded. Defaults to "Add Habit". */
	label?: string;
	/** Expanded pill width. Defaults to 148. */
	expandedWidth?: number;
}

export function FAB({ onPress, isExpanded, label = "Add Habit", expandedWidth = 148 }: FABProps) {
	const Colors = useAppColors();
	const theme = useTheme();
	const insets = useSafeAreaInsets();
	const isIOS = Platform.OS === "ios";
	const bottomOffset = isIOS ? insets.bottom + 76 : Spacing.xxxl;
	const height = isIOS ? 52 : 56;

	const animatedStyle = useAnimatedStyle(() => {
		return {
			width: withSpring(isExpanded.value === 1 ? expandedWidth : height, {
				damping: 10,
				stiffness: 150,
				mass: 0.3,
			}),
		};
	});

	const textStyle = useAnimatedStyle(() => {
		return {
			opacity: withTiming(isExpanded.value === 1 ? 1 : 0, { duration: 150 }),
			transform: [{ scale: withTiming(isExpanded.value === 1 ? 1 : 0.8, { duration: 150 }) }],
			width: withTiming(isExpanded.value === 1 ? 100 : 0, { duration: 150 }),
		};
	});

	return (
		<Animated.View
			style={[
				{
					position: "absolute",
					bottom: bottomOffset,
					right: Spacing.xl,
					height,
					borderRadius: isIOS ? height / 2 : 16,
					backgroundColor: Colors.accent,
					overflow: "hidden",
					elevation: isIOS ? 0 : 10,
					zIndex: 10,
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: isIOS ? 0.12 : 0.15,
					shadowRadius: isIOS ? 16 : 12,
				},
				animatedStyle,
			]}
		>
			<Pressable
				onPress={onPress}
				style={{
					flex: 1,
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "center",
				}}
				android_ripple={{ color: theme.dark ? Colors.border : Colors.surface }}
			>
				<View style={{ alignItems: "center", justifyContent: "center" }}>
					<SymbolView
						name={{ ios: "plus", android: "add", web: "add" }}
						size={24}
						tintColor={Colors.background}
						fallback={<Body style={{ color: Colors.background, fontSize: 24, lineHeight: 28 }}>+</Body>}
					/>
				</View>
				<Animated.View style={textStyle}>
					<Body
						style={{
							color: Colors.background,
							fontSize: 16,
							fontFamily: Fonts.utilityMedium,
							marginLeft: 8,
						}}
						numberOfLines={1}
					>
						{label}
					</Body>
				</Animated.View>
			</Pressable>
		</Animated.View>
	);
}
