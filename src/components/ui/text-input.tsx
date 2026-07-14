/**
 * Styled TextInput with floating label.
 * Bottom-border only style — Platinum (#E0E0E0) → Slate Blue (#36454F) on focus.
 */

import { useAppColors } from "@/hooks/use-app-colors";
import { Fonts, FontSizes, Spacing } from "@/constants/theme";
import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import {
	Keyboard,
	Pressable,
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

export const TextInput = forwardRef<RNTextInput, TextInputProps>(({
	label,
	value,
	onChangeText,
	placeholder,
	onFocus,
	onBlur,
	...props
}: TextInputProps, ref) => {
	const Colors = useAppColors();
	const [focused, setFocused] = useState(false);
	const [showPlaceholder, setShowPlaceholder] = useState(false);
	const hasValue = Boolean(value && value.length > 0);
	const isActive = focused || hasValue;

	// Merge the forwarded ref with an internal one so we can blur it ourselves.
	const innerRef = useRef<RNTextInput>(null);
	const focusedRef = useRef(false);
	const lastFocusAt = useRef(0);
	const setRefs = useCallback(
		(node: RNTextInput | null) => {
			innerRef.current = node;
			if (typeof ref === "function") ref(node);
			else if (ref) {
				(ref as React.MutableRefObject<RNTextInput | null>).current = node;
			}
		},
		[ref],
	);

	const focusInput = useCallback(() => {
		innerRef.current?.focus();
	}, []);

	// Android keeps the TextInput focused when the keyboard is dismissed by
	// tapping away, so a second tap fires no focus event and the keyboard never
	// reopens. Force a blur on keyboard-hide to restore the tap-to-focus cycle.
	// Ignore hide events that land right after a new focus (stale hide callbacks).
	useEffect(() => {
		const sub = Keyboard.addListener("keyboardDidHide", () => {
			if (Date.now() - lastFocusAt.current < 200) return;
			if (focusedRef.current) innerRef.current?.blur();
		});
		return () => sub.remove();
	}, []);

	const borderStyle = useAnimatedStyle(() => ({
		borderBottomWidth: withTiming(focused ? 2 : 1, { duration: 200 }),
	}));

	const labelStyle = useAnimatedStyle(() => ({
		fontSize: withTiming(isActive ? FontSizes.xs : FontSizes.md, {
			duration: 200,
		}),
		top: withTiming(isActive ? 0 : Spacing.xl, { duration: 200 }),
	}));

	return (
		<Pressable onPress={focusInput}>
			<AnimatedView
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
					pointerEvents="none"
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
				<RNTextInput
					ref={setRefs}
					value={value}
					onChangeText={onChangeText}
					onFocus={(e) => {
						lastFocusAt.current = Date.now();
						setFocused(true);
						focusedRef.current = true;
						// Delay placeholder to wait for label animation
						setTimeout(() => setShowPlaceholder(true), 150);
						onFocus?.(e);
					}}
					onBlur={(e) => {
						setFocused(false);
						focusedRef.current = false;
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
							backgroundColor: "red",
						} satisfies TextStyle
					}
					{...props}
				/>
			</AnimatedView>
		</Pressable>
	);
});
