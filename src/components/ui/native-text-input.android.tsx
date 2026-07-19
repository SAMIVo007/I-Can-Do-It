/**
 * Native Jetpack Compose TextField (Android) — used only inside native bottom
 * sheets (add-habit / add-goal), where an RN TextInput embedded in Compose's
 * RNHostView has unreliable taps/keyboard.
 *
 * Rendering a Compose `BasicTextField` inside a `Host` makes the editable text a
 * genuine native view hosted in RN (the well-supported direction), so taps and
 * the keyboard behave correctly.
 *
 * Colors come from the Material 3 / Material You palette (useMaterialColors) so
 * the field matches the rest of the app's dynamic theming. When the user forces
 * a manual light/dark theme, we fall back to the static Slate & Sage palette to
 * match the forced app colors.
 */

import {
  DarkColors,
  Fonts,
  FontSizes,
  LightColors,
  Spacing,
} from "@/constants/theme";
import { useResolvedColorScheme } from "@/hooks/use-app-colors";
import { storage } from "@/utils/storage";
import {
  BasicTextField,
  Box,
  Column,
  Host,
  Text,
  useMaterialColors,
  useNativeState,
  type TextFieldKeyboardType,
  type TextFieldRef,
} from "@expo/ui/jetpack-compose";
import {
  background,
  fillMaxWidth,
  height,
  padding,
} from "@expo/ui/jetpack-compose/modifiers";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { AppTextInputProps, TextInputHandle } from "./text-input-types";

/**
 * Resolve field colors to concrete hex, matching the rest of the app:
 * - "system" theme → Material You palette
 * - forced light/dark → static Slate & Sage palette
 */
function useFieldColors() {
  const material = useMaterialColors();
  const scheme = useResolvedColorScheme();
  const [appTheme, setAppTheme] = useState(() =>
    storage.get<"system" | "light" | "dark">("appTheme", "system"),
  );

  useEffect(() => {
    const unsubscribe = storage.subscribe("appTheme", () => {
      setAppTheme(storage.get("appTheme", "system"));
    });
    return unsubscribe;
  }, []);

  if (appTheme === "system") {
    return {
      accent: material.primary,
      textPrimary: material.onSurface,
      textSecondary: material.onSurfaceVariant,
      border: material.outline,
    };
  }

  const pal = scheme === "dark" ? DarkColors : LightColors;
  return {
    accent: pal.accent,
    textPrimary: pal.textPrimary,
    textSecondary: pal.textSecondary,
    border: pal.border,
  };
}

export const NativeTextInput = forwardRef<TextInputHandle, AppTextInputProps>(
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
    const Colors = useFieldColors();
    const colorScheme = useResolvedColorScheme();
    const [focused, setFocused] = useState(false);

    const state = useNativeState(value ?? "");
    const nativeRef = useRef<TextFieldRef>(null);

    // Push external (React-controlled) value changes into the native field,
    // guarding against the echo from the user's own keystrokes.
    useEffect(() => {
      const next = value ?? "";
      if (state.value !== next) {
        state.value = next;
      }
    }, [value, state]);

    useImperativeHandle(ref, () => ({
      focus: () => {
        nativeRef.current?.focus();
      },
      blur: () => {
        nativeRef.current?.blur();
      },
    }));

    // ModalBottomSheet must finish presenting before Compose focus works.
    // Native autoFocus alone is too early and often no-ops.
    useEffect(() => {
      if (!autoFocus) return;
      const timer = setTimeout(() => {
        nativeRef.current?.focus();
      }, 450);
      return () => clearTimeout(timer);
    }, [autoFocus]);

    const labelColor = focused ? Colors.accent : Colors.textSecondary;
    const borderColor = focused ? Colors.accent : Colors.border;

    const keyboardOptions =
      keyboardType === "numeric"
        ? { keyboardType: "decimal" as TextFieldKeyboardType }
        : undefined;

    return (
      <Host
        matchContents={{ vertical: true }}
        colorScheme={colorScheme}
        style={{ width: "100%" }}
      >
        <BasicTextField
          ref={nativeRef}
          value={state}
          singleLine
          cursorColor={Colors.accent}
          keyboardOptions={keyboardOptions}
          onValueChange={(text) => onChangeText?.(text)}
          onFocusChanged={(isFocused) => {
            setFocused(isFocused);
            if (isFocused) onFocus?.();
            else onBlur?.();
          }}
          textStyle={{
            fontFamily: Fonts.utility,
            fontSize: FontSizes.lg,
            color: Colors.textPrimary,
          }}
          modifiers={[fillMaxWidth()]}
        >
          <BasicTextField.DecorationBox>
            <Column
              modifiers={[
                fillMaxWidth(),
                padding(0, Spacing.md, 0, Spacing.sm),
              ]}
            >
              <Text
                color={labelColor}
                style={{ fontFamily: Fonts.utility, fontSize: FontSizes.xs }}
              >
                {label}
              </Text>
              <Box
                modifiers={[
                  fillMaxWidth(),
                  padding(0, Spacing.xs, 0, Spacing.sm),
                ]}
              >
                {placeholder ? (
                  <BasicTextField.Placeholder>
                    <Text
                      color={Colors.textSecondary}
                      style={{
                        fontFamily: Fonts.utility,
                        fontSize: FontSizes.lg,
                      }}
                    >
                      {placeholder}
                    </Text>
                  </BasicTextField.Placeholder>
                ) : null}
                <BasicTextField.InnerTextField />
              </Box>
              <Box
                modifiers={[
                  fillMaxWidth(),
                  height(focused ? 2 : 1),
                  background(borderColor),
                ]}
              />
            </Column>
          </BasicTextField.DecorationBox>
        </BasicTextField>
      </Host>
    );
  },
);

NativeTextInput.displayName = "NativeTextInput";
