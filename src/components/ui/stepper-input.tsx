import { Body } from "@/components/ui/typography";
import { Colors, Fonts, FontSizes, Spacing } from "@/constants/theme";
import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
import {
	Pressable,
	TextInput as RNTextInput,
	View,
	type TextStyle,
	type ViewStyle,
} from "react-native";
import Animated, {
	FadeInDown,
	FadeInUp,
	FadeOutDown,
	FadeOutUp,
	useAnimatedStyle,
	withTiming,
} from "react-native-reanimated";

interface StepperInputProps {
	label: string;
	value: string;
	onChangeText: (val: string) => void;
	min?: number;
}

export function StepperInput({
	label,
	value,
	onChangeText,
	min = 1,
}: StepperInputProps) {
	const [focused, setFocused] = useState(false);
	const [direction, setDirection] = useState<"up" | "down">("up");
	const inputRef = useRef<RNTextInput>(null);

	const numericValue = parseInt(value) || min;

	const targetValueRef = useRef(numericValue);
	useEffect(() => {
		targetValueRef.current = numericValue;
	}, [numericValue]);

	const handleDecrement = () => {
		setDirection("down");
		targetValueRef.current = Math.max(min, targetValueRef.current - 1);
		const nextVal = targetValueRef.current;
		requestAnimationFrame(() => {
			onChangeText(nextVal.toString());
		});
	};

	const handleIncrement = () => {
		setDirection("up");
		targetValueRef.current = targetValueRef.current + 1;
		const nextVal = targetValueRef.current;
		requestAnimationFrame(() => {
			onChangeText(nextVal.toString());
		});
	};

	const isActive = focused || value.length > 0;

	// Floating label style similar to TextInput
	const labelStyle = useAnimatedStyle(() => ({
		fontSize: withTiming(isActive ? FontSizes.xs : FontSizes.md, {
			duration: 200,
		}),
		top: withTiming(isActive ? 0 : Spacing.xl, { duration: 200 }),
	}));

	const borderStyle = useAnimatedStyle(() => ({
		borderBottomWidth: withTiming(focused ? 2 : 1, { duration: 200 }),
	}));

	return (
		<Animated.View
			style={[
				{
					paddingTop: Spacing.lg,
					paddingBottom: Spacing.sm,
					borderBottomColor: (focused ? Colors.accent : Colors.border) as any,
				} satisfies ViewStyle,
				borderStyle,
			]}
		>
			<Animated.Text
				style={[
					{
						fontFamily: Fonts.utility,
						position: "absolute",
						color: (focused ? Colors.accent : Colors.textSecondary) as any,
					} satisfies TextStyle,
					labelStyle,
				]}
			>
				{label}
			</Animated.Text>

			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					paddingTop: Spacing.xs,
				}}
			>
				{/* Minus Button */}
				<Pressable
					onPress={handleDecrement}
					hitSlop={30}
					style={({ pressed }) => ({
						opacity: pressed ? 0.6 : 1,
						padding: Spacing.xs,
						zIndex: 1,
					})}
					android_ripple={{ borderless: true, color: numericValue <= min ? Colors.transparent : Colors.accent, radius: 28, foreground: true }}
				>
					<SymbolView
						name={{ ios: "minus.circle", android: "remove", web: "remove" }}
						size={24}
						tintColor={numericValue <= min ? Colors.border : Colors.accent}
						fallback={<Body style={{ color: Colors.accent, fontSize: 24 }}>-</Body>}
					/>
				</Pressable>

				{/* Value Display / Input */}
				<View
					style={{
						flex: 1,
						alignItems: "center",
						justifyContent: "center",
						minHeight: 36,
					}}
				>
					{focused ? (
						<RNTextInput
							ref={inputRef}
							value={value}
							onChangeText={onChangeText}
							onBlur={() => setFocused(false)}
							keyboardType="numeric"
							autoFocus
							style={{
								fontFamily: Fonts.utility,
								fontSize: FontSizes.xl,
								lineHeight: 28,
								color: Colors.textPrimary,
								textAlign: "center",
								width: "100%",
								paddingVertical: 0,
								paddingHorizontal: 0,
								margin: 0,
								includeFontPadding: false,
							}}
						/>
					) : (
						<Pressable
							onPress={() => setFocused(true)}
							style={{ width: "100%", alignItems: "center", paddingVertical: 4 }}
						>
							<Animated.Text
								key={value}
								entering={
									direction === "up"
										? FadeInDown.duration(200).springify()
										: FadeInUp.duration(200).springify()
								}
								exiting={
									direction === "up"
										? FadeOutUp.duration(200)
										: FadeOutDown.duration(200)
								}
								style={{
									fontFamily: Fonts.utilityMedium,
									fontSize: FontSizes.xl,
									lineHeight: 28,
									color: Colors.textPrimary,
									includeFontPadding: false,
								}}
							>
								{value}
							</Animated.Text>
						</Pressable>
					)}
				</View>

				{/* Plus Button */}
				<Pressable
					onPress={handleIncrement}
					hitSlop={30}
					style={({ pressed }) => ({
						opacity: pressed ? 0.6 : 1,
						padding: Spacing.xs,
						zIndex: 1,
					})}
					android_ripple={{ borderless: true, color: Colors.accent, radius: 28, foreground: true }}
				>
					<SymbolView
						name={{ ios: "plus.circle", android: "add", web: "add" }}
						size={24}
						tintColor={Colors.accent}
						fallback={<Body style={{ color: Colors.accent, fontSize: 24 }}>+</Body>}
					/>
				</Pressable>
			</View>
		</Animated.View>
	);
}
