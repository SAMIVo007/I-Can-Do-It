/**
 * Styled TextInput with floating label.
 * Bottom-border only style — Platinum (#E0E0E0) → Slate Blue (#36454F) on focus.
 */

import { Colors, Fonts, FontSizes, Spacing } from "@/constants/theme";
import React, { useState } from "react";
import {
	TextInput as RNTextInput,
	View,
	type TextInputProps as RNTextInputProps,
	type TextStyle,
	type ViewStyle,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	withTiming,
} from "react-native-reanimated";

interface TextInputProps extends Omit<RNTextInputProps, "style"> {
	label: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function TextInput({
	label,
	value,
	onChangeText,
	placeholder,
	onFocus,
	onBlur,
	...props
}: TextInputProps) {
	const [focused, setFocused] = useState(false);
	const [showPlaceholder, setShowPlaceholder] = useState(false);
	const hasValue = Boolean(value && value.length > 0);
	const isActive = focused || hasValue;

	const borderStyle = useAnimatedStyle(() => ({
		borderBottomColor: withTiming(focused ? Colors.accent : Colors.border, {
			duration: 200,
		}),
		borderBottomWidth: withTiming(focused ? 2 : 1, { duration: 200 }),
	}));

	const labelStyle = useAnimatedStyle(() => ({
		fontSize: withTiming(isActive ? FontSizes.xs : FontSizes.md, {
			duration: 200,
		}),
		top: withTiming(isActive ? 0 : Spacing.xl, { duration: 200 }),
		color: withTiming(focused ? Colors.accent : Colors.textSecondary, {
			duration: 200,
		}),
	}));

	return (
		<AnimatedView
			style={[
				{
					paddingTop: Spacing.lg,
					paddingBottom: Spacing.sm,
				} satisfies ViewStyle,
				borderStyle,
			]}
		>
			<Animated.Text
				style={[
					{
						fontFamily: Fonts.utility,
						position: "absolute",
					} satisfies TextStyle,
					labelStyle,
				]}
			>
				{label}
			</Animated.Text>
			<RNTextInput
				value={value}
				onChangeText={onChangeText}
				onFocus={(e) => {
					setFocused(true);
					// Delay placeholder to wait for label animation
					setTimeout(() => setShowPlaceholder(true), 150);
					onFocus?.(e);
				}}
				onBlur={(e) => {
					setFocused(false);
					setShowPlaceholder(false);
					onBlur?.(e);
				}}
				placeholder={showPlaceholder ? placeholder : ""}
				placeholderTextColor={Colors.textSecondary}
				style={
					{
						fontFamily: Fonts.utility,
						fontSize: FontSizes.lg,
						color: Colors.textPrimary,
						paddingVertical: Spacing.xs,
						paddingHorizontal: 0,
					} satisfies TextStyle
				}
				{...props}
			/>
		</AnimatedView>
	);
}
