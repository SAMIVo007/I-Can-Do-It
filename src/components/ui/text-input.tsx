/**
 * Styled TextInput with floating label (iOS / web).
 * Bottom-border only style — border → accent on focus.
 *
 * Android uses the native Jetpack Compose field in text-input.android.tsx.
 * The public props/handle are shared via text-input-types.ts so callers are
 * platform-agnostic.
 */

import { Fonts, FontSizes, Spacing } from "@/constants/theme";
import { useAppColors } from "@/hooks/use-app-colors";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  TextInput as RNTextInput,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import type { AppTextInputProps, TextInputHandle } from "./text-input-types";

const AnimatedView = Animated.createAnimatedComponent(View);

export const TextInput = forwardRef<TextInputHandle, AppTextInputProps>(
  (
    {
      label,
      value,
      onChangeText,
      placeholder,
      autoFocus,
      keyboardType = "default",
      onFocus,
      onBlur,
    },
    ref,
  ) => {
    const Colors = useAppColors();
    const [focused, setFocused] = useState(false);
    const hasValue = Boolean(value && value.length > 0);
    const isActive = focused || hasValue;

    const innerRef = useRef<RNTextInput>(null);
    useImperativeHandle(ref, () => ({
      focus: () => innerRef.current?.focus(),
      blur: () => innerRef.current?.blur(),
    }));

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
          ref={innerRef}
          value={value}
          onChangeText={onChangeText}
          autoFocus={autoFocus}
          keyboardType={keyboardType === "numeric" ? "numeric" : "default"}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          placeholder={focused ? placeholder : ""}
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
        />
      </AnimatedView>
    );
  },
);

TextInput.displayName = "TextInput";
