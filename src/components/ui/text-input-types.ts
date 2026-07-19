/**
 * Shared contract for the app's TextInput across platforms.
 * - Android renders a native Jetpack Compose BasicTextField (text-input.android.tsx)
 * - iOS / web render the React Native implementation (text-input.tsx)
 *
 * Both expose the same props and imperative handle so callers stay platform-agnostic.
 */

export interface AppTextInputProps {
  label: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  keyboardType?: "default" | "numeric";
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface TextInputHandle {
  focus: () => void;
  blur: () => void;
}
