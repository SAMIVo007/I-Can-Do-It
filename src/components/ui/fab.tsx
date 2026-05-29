import { Body } from "@/components/ui/typography";
import { Fonts, Spacing } from "@/constants/theme";
import { useAppColors } from "@/hooks/use-app-colors";
import { useTheme } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, View } from "react-native";
import Animated, {
	SharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
} from "react-native-reanimated";

interface FABProps {
	onPress: () => void;
	isExpanded: SharedValue<number>;
}

export function FAB({ onPress, isExpanded }: FABProps) {
	const Colors = useAppColors();
	const theme = useTheme();

	const animatedStyle = useAnimatedStyle(() => {
		return {
			width: withSpring(isExpanded.value === 1 ? 148 : 56, {
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
					bottom: Spacing.xxxl,
					right: Spacing.xl,
					height: 56,
					borderRadius: 16,
					backgroundColor: Colors.accent,
					overflow: "hidden",
					elevation: 10,
					zIndex: 10,
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: 0.15,
					shadowRadius: 12,
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
					justifyContent: "flex-start",
					paddingLeft: 16,
				}}
				android_ripple={{ color: theme.dark ? Colors.border : Colors.surface }}
			>
				<View style={{ alignItems: "center" }}>
					<SymbolView
						name={{ ios: "plus", android: "add", web: "add" }}
						size={24}
						tintColor={Colors.white}
						fallback={<Body style={{ color: Colors.white, fontSize: 24, lineHeight: 28 }}>+</Body>}
					/>
				</View>
				<Animated.View style={textStyle}>
					<Body
						style={{
							color: Colors.white,
							fontSize: 16,
							fontFamily: Fonts.utilityMedium,
							marginLeft: 8,
						}}
						numberOfLines={1}
					>
						Add Habit
					</Body>
				</Animated.View>
			</Pressable>
		</Animated.View>
	);
}
